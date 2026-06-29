import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react'
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from '../../store/api/productApi'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Button       from '../../components/ui/Button'
import Pagination   from '../../components/ui/Pagination'
import EmptyState   from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatPrice } from '../../utils/formatPrice'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import ProductImage from '../../components/product/ProductImage'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const [delSlug, setDelSlug]  = useState(null)
  const debSearch = useDebounce(search, 400)

  const { data, isLoading } = useGetProductsQuery({ q: debSearch, page, limit: 15 })
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()

  const products   = data?.products   || []
  const totalPages = data?.totalPages || 1

  const handleDelete = async () => {
    try {
      await deleteProduct(delSlug).unwrap()
      toast.success('Product deleted')
      setDelSlug(null)
    } catch {
      toast.error('Could not delete product')
    }
  }

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Products
        </h1>
        <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => navigate('/admin/products/new')}>
          Add Product
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products…"
          className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">Product</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium hidden lg:table-cell">Subcategory</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium hidden md:table-cell">Brand</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium hidden xl:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">Price</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">Stock</th>
                <th className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton
                      key={i}
                      cols={8}
                      colClasses={[
                        '',
                        'hidden sm:table-cell',
                        'hidden lg:table-cell',
                        'hidden md:table-cell',
                        'hidden xl:table-cell',
                        '',
                        '',
                        ''
                      ]}
                    />
                  ))
                : products.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="py-16">
                      <EmptyState icon={Package} title="No products" />
                    </td>
                  </tr>
                )
                : products.map((product) => (
                  <tr key={product._id} className="border-b border-border hover:bg-bg-tertiary transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[var(--radius-sm)] overflow-hidden bg-bg-tertiary border border-border shrink-0">
                          <ProductImage
                            productName={product.name}
                            backendImages={product.images}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-text-primary truncate max-w-[180px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{product.subcategory || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{product.brand || '—'}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-bg-primary text-text-secondary border border-border"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-accent font-[var(--font-mono)]">
                      {formatPrice(product.discountPrice || product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock > 0 ? 'text-success' : 'text-error'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.slug}`)}
                          className="p-1.5 rounded text-text-tertiary hover:text-accent hover:bg-bg-primary transition-all"
                          aria-label="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDelSlug(product.slug)}
                          className="p-1.5 rounded text-text-tertiary hover:text-error hover:bg-error/10 transition-all"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!delSlug}
        onClose={() => setDelSlug(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        message="This will permanently remove the product and cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
