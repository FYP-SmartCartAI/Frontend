import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Upload, X, ChevronDown, AlertCircle } from 'lucide-react'
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from '../../store/api/productApi'
import { useGetCategoriesQuery } from '../../store/api/categoryApi'
import Input    from '../../components/ui/Input'
import Button   from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import toast    from 'react-hot-toast'

export default function ProductFormPage() {
  const { slug } = useParams()
  const navigate   = useNavigate()
  const isEdit     = !!slug

  const { data: existing, isLoading: loadingProduct } = useGetProductByIdQuery(slug, { skip: !isEdit })
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [uploadImages, { isLoading: uploading }] = useUploadProductImagesMutation()
  const [deleteImage, { isLoading: deletingImage }] = useDeleteProductImageMutation()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm()

  const selectedCategorySlug = watch('category')
  const watchedPrice         = watch('price')
  const selectedCategory = categories.find((cat) => cat.slug === selectedCategorySlug)
  const subcategories = selectedCategory?.subcategories ?? []

  const product = existing?.product || existing

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        name:          product.name,
        description:   product.description,
        price:         product.price,
        discountPrice: product.discountPrice,
        stock:         product.stock,
        category:      product.category?.slug || product.category,
        subcategory:   product.subcategory || '',
        brand:         product.brand || '',
      })
      setTags(Array.isArray(product.tags) ? product.tags : [])
    }
  }, [existing, isEdit, reset, product])

  // Revoke object URLs on unmount to prevent leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFileChange = (e) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files)
    }
  }

  const addFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    const existingCount = product?.images?.length || 0

    if (existingCount + selectedFiles.length + validFiles.length > 10) {
      toast.error('A product can have at most 10 images.')
      return
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setSelectedFiles((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveQueued = (index) => {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExisting = async (imgUrl) => {
    try {
      await deleteImage({ slug, url: imgUrl }).unwrap()
      toast.success('Image deleted successfully')
    } catch {
      toast.error('Could not delete image')
    }
  }

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase()
    if (!tag) return
    if (tags.length >= 20) {
      toast.error('Maximum 20 tags allowed')
      return
    }
    if (tags.includes(tag)) {
      toast.error(`Tag "${tag}" already exists`)
      setTagInput('')
      return
    }
    setTags((prev) => [...prev, tag])
    setTagInput('')
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const onSubmit = async (data) => {
    const price         = Number(data.price)
    const discountPrice = data.discountPrice ? Number(data.discountPrice) : undefined

    // Guard: discountPrice must be strictly less than price
    if (discountPrice !== undefined && discountPrice >= price) {
      toast.error('Discount price must be less than the actual price', { duration: 4000 })
      return
    }

    const payload = {
      name:          data.name,
      description:   data.description,
      price,
      discountPrice,
      stock:         Number(data.stock),
      category:      data.category,
      subcategory:   data.subcategory || '',
      brand:         data.brand?.trim() || '',
      tags,
    }

    try {
      let productSlug = slug

      if (isEdit) {
        await updateProduct({ slug, ...payload }).unwrap()
        toast.success('Product details updated')
      } else {
        const newProd = await createProduct(payload).unwrap()
        productSlug = newProd.slug || slug
        toast.success('Product created')
      }

      // If files are selected, upload them to the product
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach((file) => {
          formData.append('images', file)
        })
        await uploadImages({ slug: productSlug, formData }).unwrap()
        toast.success('Images uploaded successfully')
      }

      navigate('/admin/products')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save product')
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent mb-4 transition-colors">
        <ChevronLeft size={13} /> Products
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-5"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isEdit ? 'Edit Product' : 'New Product'}
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4">
          <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium">Basic Info</h3>

          <Input
            label="Product Name"
            error={errors.name?.message}
            {...register('name', { required: 'Required' })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">Description</label>
            <textarea
              rows={4}
              className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent resize-none"
              placeholder="Product description…"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">Category</label>
            <div className="relative flex items-center">
              <select
                className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                {...register('category', {
                  required: 'Required',
                  onChange: () => setValue('subcategory', ''),
                })}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none text-text-secondary">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.category && (
              <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                <AlertCircle size={13} className="shrink-0 text-error" />
                <span>{errors.category.message}</span>
              </p>
            )}
          </div>

          {selectedCategorySlug && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">Subcategory</label>
              <div className="relative flex items-center">
                <select
                  className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!subcategories.length}
                  {...register('subcategory')}
                >
                  <option value="">
                    {subcategories.length ? 'Select subcategory' : 'No subcategories for this category'}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub._id || sub.slug} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 pointer-events-none text-text-secondary">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          )}

          <Input
            label="Brand"
            placeholder="e.g. Samsung, Nike"
            {...register('brand')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">Tags</label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-tertiary border border-border rounded-full text-xs text-text-primary"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-text-tertiary hover:text-error transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput.trim() && addTag(tagInput)}
              placeholder="Type a tag and press Enter"
              className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent"
            />
            <p className="text-[11px] text-text-tertiary">Press Enter or comma to add. Max 20 tags.</p>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4">
          <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium">Pricing & Stock</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              min={1}
              step={1}
              error={errors.price?.message}
              {...register('price', { required: 'Required', min: { value: 1, message: 'Must be at least 1' } })}
            />
            <Input
              label="Discount Price"
              type="number"
              min={0}
              step={1}
              hint="Leave empty for no discount"
              error={errors.discountPrice?.message}
              {...register('discountPrice', {
                min: { value: 0, message: 'Must be >= 0' },
                validate: (val) => {
                  if (val === '' || val === undefined || val === null) return true
                  const numericVal = Number(val)
                  const price = Number(watchedPrice)
                  if (isNaN(numericVal)) return true
                  if (numericVal >= price) return 'Discount price must be less than the actual price'
                  return true
                },
              })}
            />
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              error={errors.stock?.message}
              {...register('stock', { required: 'Required', min: { value: 0, message: 'Must be >= 0' } })}
            />
          </div>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4">
          <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium">Images</h3>

          {/* Existing Images */}
          {isEdit && product?.images?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Existing Images
              </label>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((imgUrl, index) => (
                  <div key={index} className="relative aspect-square bg-bg-tertiary border border-border rounded-[var(--radius-md)] overflow-hidden group">
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={deletingImage}
                      onClick={() => handleDeleteExisting(imgUrl)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-error rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dropzone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Upload New Images
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
              className="border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <Upload size={24} className="text-text-tertiary group-hover:text-accent transition-colors" />
              <p className="text-sm font-medium text-text-secondary">
                Drag & drop images here, or <span className="text-accent hover:underline">browse</span>
              </p>
              <p className="text-xs text-text-tertiary">Supports JPEG, PNG, WEBP (max 10 total)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* New previews */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                New Images to Upload ({selectedFiles.length})
              </label>
              <div className="grid grid-cols-4 gap-3">
                {previews.map((previewUrl, index) => (
                  <div key={index} className="relative aspect-square bg-bg-tertiary border border-border rounded-[var(--radius-md)] overflow-hidden group">
                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveQueued(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-error rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from queue"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            icon={<Save size={15} />}
            loading={creating || updating || uploading}
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
