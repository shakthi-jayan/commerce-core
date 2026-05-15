import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUploadCloud, FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    stock: '',
    category: '',
    brand: '',
    isActive: true,
    isFeatured: false,
  });

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);

  useEffect(() => {
    loadFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFormData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load categories
      const { data: catData } = await adminService.getCategories();
      setCategories(catData.categories || catData.data || []);

      // Load product when editing
      if (isEdit) {
        const { data } = await adminService.getProduct(id);
        const p = data.product;
        setFormData({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          compareAtPrice: p.compareAtPrice ?? '',
          sku: p.sku || '',
          stock: p.stock ?? '',
          category: p.category?._id || p.category || '',
          brand: p.brand || '',
          isActive: p.isActive !== false,
          isFeatured: !!p.isFeatured,
        });
        setExistingImages(p.images || []);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load form data';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setNewImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'] },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB per file
  });

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image permanently?')) return;
    setDeletingImageId(imageId);
    try {
      await adminService.deleteProductImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
    setDeletingImageId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) { toast.error('Product name is required'); return false; }
    if (!formData.description.trim()) { toast.error('Description is required'); return false; }
    if (!formData.price || Number(formData.price) < 0) { toast.error('Valid price is required'); return false; }
    if (!formData.stock && formData.stock !== 0) { toast.error('Stock is required'); return false; }
    if (!formData.category) { toast.error('Category is required'); return false; }
    if (!isEdit && !formData.sku.trim() && newImages.length === 0 && existingImages.length === 0) {
      // Allow empty SKU (auto-generate), but warn about no images
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = new FormData();

      // Append text fields — handle special cases
      payload.append('name', formData.name.trim());
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('stock', formData.stock);
      payload.append('category', formData.category);
      payload.append('isActive', formData.isActive);
      payload.append('isFeatured', formData.isFeatured);

      // SKU: auto-generate if empty
      if (formData.sku.trim()) {
        payload.append('sku', formData.sku.trim());
      } else {
        payload.append('sku', 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      }

      // Optional fields — only append when non-empty
      if (formData.compareAtPrice !== '' && formData.compareAtPrice !== null) {
        payload.append('compareAtPrice', formData.compareAtPrice);
      }
      if (formData.brand.trim()) {
        payload.append('brand', formData.brand.trim());
      }

      // Append new image files
      newImages.forEach((file) => {
        payload.append('images', file);
      });

      if (isEdit) {
        await adminService.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map((e) => `${e.field}: ${e.message}`)
          .join('\n');
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save product');
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading product data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Form</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadFormData}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/admin/products')}>
            <FiArrowLeft /> Back
          </Button>
          <h2 style={{ fontWeight: 800, margin: 0 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        </div>
        <Button variant="primary" onClick={handleSubmit} disabled={saving} className="btn-primary-custom">
          <FiSave className="me-2" /> {saving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="card-custom border-0 shadow-sm mb-4 p-4">
              <h5 className="mb-4 fw-bold">Basic Information</h5>

              <Form.Group className="mb-3">
                <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="form-control-custom"
                  maxLength={200}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                <div style={{ height: 250, marginBottom: 50 }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    style={{ height: '100%' }}
                  />
                </div>
              </Form.Group>
            </Card>

            <Card className="card-custom border-0 shadow-sm p-4 mb-4">
              <h5 className="mb-4 fw-bold">Media</h5>

              {existingImages.length > 0 && (
                <div className="mb-3">
                  <Form.Label>Existing Images</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {existingImages.map((img) => (
                      <div key={img._id} className="position-relative">
                        <img
                          src={img.url}
                          alt="Product"
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: img.isMain ? '3px solid var(--primary)' : '1px solid var(--border)',
                          }}
                        />
                        {img.isMain && (
                          <span
                            className="badge bg-primary position-absolute bottom-0 start-0"
                            style={{ fontSize: 9 }}
                          >
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(img._id)}
                          disabled={deletingImageId === img._id}
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1 rounded-circle"
                          style={{ transform: 'translate(30%, -30%)', lineHeight: 1 }}
                          title="Delete image"
                        >
                          {deletingImageId === img._id ? (
                            <Spinner size="sm" animation="border" style={{ width: 12, height: 12 }} />
                          ) : (
                            <FiTrash2 size={12} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Form.Label>Upload New Images</Form.Label>
              <div
                {...getRootProps()}
                className={`dropzone-container p-5 text-center rounded border ${isDragActive ? 'border-primary' : 'border-dashed border-secondary'}`}
                style={{ cursor: 'pointer', borderStyle: 'dashed', background: isDragActive ? 'var(--bg-elevated)' : 'transparent' }}
              >
                <input {...getInputProps()} />
                <FiUploadCloud size={40} className="text-muted mb-2" />
                <p className="mb-0 text-muted">
                  Drag & drop images here, or click to select (max 5, 5MB each)
                </p>
              </div>

              {newImages.length > 0 && (
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {newImages.map((file, idx) => (
                    <div key={idx} className="position-relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1 rounded-circle"
                        style={{ transform: 'translate(30%, -30%)', lineHeight: 1 }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="card-custom border-0 shadow-sm p-4 mb-4">
              <h5 className="mb-4 fw-bold">Pricing & Stock</h5>

              <Form.Group className="mb-3">
                <Form.Label>Price (₹) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Compare at Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="form-control-custom"
                  placeholder="Original price before discount"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Stock Quantity <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="form-control-custom"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Leave empty to auto-generate"
                  className="form-control-custom"
                />
                <Form.Text className="text-muted">
                  Auto-generated if left empty.
                </Form.Text>
              </Form.Group>
            </Card>

            <Card className="card-custom border-0 shadow-sm p-4 mb-4">
              <h5 className="mb-4 fw-bold">Organization</h5>

              <Form.Group className="mb-3">
                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Product brand"
                  className="form-control-custom"
                  maxLength={100}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="active-switch"
                  label="Product is Active"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="featured-switch"
                  label="Featured Product"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AdminProductForm;
