import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useDeleteSubcategoryMutation,
} from '../../store/api/categoryApi'
import Button        from '../../components/ui/Button'
import Input         from '../../components/ui/Input'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner       from '../../components/ui/Spinner'
import EmptyState    from '../../components/ui/EmptyState'
import toast         from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [createCat, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCat, { isLoading: updating }] = useUpdateCategoryMutation()
  const [deleteCat, { isLoading: deleting }] = useDeleteCategoryMutation()
  const [addSub, { isLoading: addingSub }] = useAddSubcategoryMutation()
  const [deleteSub, { isLoading: deletingSub }] = useDeleteSubcategoryMutation()

  const [editTarget, setEditTarget] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [delSlug, setDelSlug]           = useState(null)
  const [newSubName, setNewSubName] = useState('')
  const [localSubs, setLocalSubs]   = useState([])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const openEdit = (cat) => {
    setEditTarget(cat)
    setValue('name', cat.name)
    setValue('description', cat.description || '')
  }

  const handleAddLocalSub = () => {
    if (!newSubName.trim()) return
    const exists = localSubs.some(s => s.toLowerCase() === newSubName.trim().toLowerCase())
    if (exists) return toast.error('Subcategory already added')
    setLocalSubs(prev => [...prev, newSubName.trim()])
    setNewSubName('')
  }

  const handleDeleteLocalSub = (subName) => {
    setLocalSubs(prev => prev.filter(s => s !== subName))
  }

  const handleAddSub = async () => {
    if (!newSubName.trim() || !editTarget) return
    try {
      const updated = await addSub({ slug: editTarget.slug, name: newSubName.trim() }).unwrap()
      toast.success('Subcategory added')
      setEditTarget(updated.data || updated)
      setNewSubName('')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add subcategory')
    }
  }

  const handleDeleteSub = async (subSlug) => {
    if (!editTarget) return
    try {
      await deleteSub({ slug: editTarget.slug, subSlug }).unwrap()
      toast.success('Subcategory removed')
      setEditTarget(prev => ({
        ...prev,
        subcategories: prev.subcategories.filter(s => s.slug !== subSlug)
      }))
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove subcategory')
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editTarget) {
        await updateCat({ slug: editTarget.slug, ...data }).unwrap()
        toast.success('Category updated')
        setEditTarget(null)
      } else {
        await createCat({ ...data, subcategories: localSubs }).unwrap()
        toast.success('Category created')
        setShowCreate(false)
        setLocalSubs([])
      }
      reset()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCat(delSlug).unwrap()
      toast.success('Category deleted')
      setDelSlug(null)
    } catch {
      toast.error('Could not delete category')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Categories
        </h1>
        <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => { setShowCreate(true); reset() }}>
          Add Category
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tag} title="No categories" message="Create your first category to organize products." />
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border rounded-[var(--radius-lg)] hover:border-accent/20 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Tag size={13} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                {cat.description && <p className="text-xs text-text-tertiary">{cat.description}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-text-tertiary hover:text-accent transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDelSlug(cat.slug)} className="p-1.5 text-text-tertiary hover:text-error transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={showCreate || !!editTarget}
        onClose={() => { setShowCreate(false); setEditTarget(null); setNewSubName(''); setLocalSubs([]); reset() }}
        title={editTarget ? 'Edit Category' : 'New Category'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCreate(false); setEditTarget(null); setNewSubName(''); setLocalSubs([]); reset() }}>
              Cancel
            </Button>
            <Button variant="gold" form="cat-form" type="submit" loading={creating || updating}>
              {editTarget ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            error={errors.name?.message}
            {...register('name', { required: 'Required' })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">Description</label>
            <textarea
              rows={2}
              className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent resize-none"
              {...register('description')}
            />
          </div>

          {(editTarget || showCreate) && (
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest block">Subcategories</label>
              
              {/* Existing Subcategories tags/list */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {editTarget ? (
                  editTarget.subcategories?.length > 0 ? (
                    editTarget.subcategories.map((sub) => (
                      <div 
                        key={sub._id || sub.slug} 
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-tertiary border border-border rounded-full text-xs text-text-primary"
                      >
                        <span>{sub.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.slug)}
                          disabled={deletingSub}
                          className="text-text-tertiary hover:text-error transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-tertiary italic">No subcategories yet</p>
                  )
                ) : (
                  localSubs.length > 0 ? (
                    localSubs.map((subName) => (
                      <div 
                        key={subName} 
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-tertiary border border-border rounded-full text-xs text-text-primary"
                      >
                        <span>{subName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocalSub(subName)}
                          className="text-text-tertiary hover:text-error transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-tertiary italic">No subcategories yet</p>
                  )
                )}
              </div>

              {/* Add Subcategory input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New subcategory..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="flex-1 bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                />
                <Button 
                  type="button" 
                  variant="gold" 
                  size="sm" 
                  onClick={editTarget ? handleAddSub : handleAddLocalSub}
                  loading={addingSub}
                  disabled={!newSubName.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!delSlug}
        onClose={() => setDelSlug(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete category?"
        message="Products in this category will lose their category assignment."
      />
    </div>
  )
}
