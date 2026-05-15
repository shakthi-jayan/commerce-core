import { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
  Modal,
  Row,
  Col,
} from 'react-bootstrap';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiX,
  FiSave,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '',
  description: '',
  slug: '',
  isActive: true,
  sortOrder: 0,
  parentCategory: '',
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating, category obj = editing
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load categories';
      setError(message);
      toast.error(message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Modal handlers ─────────────────────────────────────────
  const openCreateModal = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditing(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      slug: cat.slug || '',
      isActive: cat.isActive !== false,
      sortOrder: cat.sortOrder ?? 0,
      parentCategory: cat.parentCategory?._id || cat.parentCategory || '',
    });
    setImageFile(null);
    setImagePreview(cat.image || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(editing?.image || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      if (formData.description.trim()) {
        payload.append('description', formData.description.trim());
      }
      if (formData.slug.trim()) {
        payload.append('slug', formData.slug.trim());
      }
      payload.append('isActive', formData.isActive);
      payload.append('sortOrder', formData.sortOrder);
      if (formData.parentCategory) {
        payload.append('parentCategory', formData.parentCategory);
      }
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editing) {
        await adminService.updateCategory(editing._id, payload);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(payload);
        toast.success('Category created');
      }

      closeModal();
      fetchCategories();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to save category');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}" permanently?`)) return;
    setDeletingId(id);
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
    setDeletingId(null);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 800, margin: 0 }}>Categories</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchCategories}
            title="Refresh"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin-animation' : ''} />
          </Button>
          <Button
            variant="primary"
            className="btn-primary-custom"
            onClick={openCreateModal}
          >
            <FiPlus className="me-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}{' '}
          <Button variant="link" className="p-0" onClick={fetchCategories}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Category Grid */}
      {loading && categories.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-3">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="card-custom p-5 text-center">
          <FiImage size={48} className="text-muted mb-3" />
          <h5 className="fw-bold">No Categories Yet</h5>
          <p className="text-muted mb-4">Create your first category to organize your products.</p>
          <Button variant="primary" className="btn-primary-custom" onClick={openCreateModal}>
            <FiPlus className="me-2" /> Create Category
          </Button>
        </div>
      ) : (
        <Row className="g-3">
          {categories.map((cat) => (
            <Col key={cat._id} xs={12} sm={6} md={4} lg={3}>
              <div
                className="card-custom p-0 h-100 overflow-hidden"
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                {/* Image */}
                <div
                  style={{
                    height: 140,
                    background: cat.image
                      ? `url(${cat.image}) center/cover no-repeat`
                      : 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {!cat.image && (
                    <FiImage size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h6 className="fw-bold mb-0">{cat.name}</h6>
                      <small className="text-muted">/{cat.slug}</small>
                    </div>
                    <Badge bg={cat.isActive ? 'success' : 'secondary'} style={{ fontSize: 10 }}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {cat.description && (
                    <p
                      className="text-muted mb-2"
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {cat.description}
                    </p>
                  )}

                  {cat.subcategories?.length > 0 && (
                    <small className="text-muted d-block mb-2">
                      {cat.subcategories.length} subcategories
                    </small>
                  )}

                  <div className="d-flex gap-2 mt-auto">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-fill"
                      onClick={() => openEditModal(cat)}
                    >
                      <FiEdit2 size={13} className="me-1" /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(cat._id, cat.name)}
                      disabled={deletingId === cat._id}
                    >
                      {deletingId === cat._id ? (
                        <Spinner size="sm" animation="border" style={{ width: 13, height: 13 }} />
                      ) : (
                        <FiTrash2 size={13} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────── */}
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header
          closeButton
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <Modal.Title style={{ fontWeight: 700 }}>
            {editing ? 'Edit Category' : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-body)', color: 'var(--text-primary)' }}>
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Category Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Electronics, Clothing"
                    className="form-control-custom"
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="Auto-generated from name if empty"
                    className="form-control-custom"
                  />
                  <Form.Text className="text-muted">
                    URL-friendly identifier. Leave empty to auto-generate.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of this category"
                    className="form-control-custom"
                    maxLength={500}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Parent Category</Form.Label>
                  <Form.Select
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleChange}
                    className="form-control-custom"
                  >
                    <option value="">None (top-level)</option>
                    {categories
                      .filter((c) => c._id !== editing?._id) // can't be own parent
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col xs={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort Order</Form.Label>
                      <Form.Control
                        type="number"
                        name="sortOrder"
                        value={formData.sortOrder}
                        onChange={handleChange}
                        min="0"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} className="d-flex align-items-end pb-3">
                    <Form.Check
                      type="switch"
                      id="category-active-switch"
                      label="Active"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
              </Col>

              <Col md={5}>
                <Form.Label>Category Image</Form.Label>
                <div
                  className="rounded border text-center p-4"
                  style={{
                    borderStyle: 'dashed',
                    borderColor: 'var(--border)',
                    background: 'var(--bg-card)',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {imagePreview ? (
                    <div className="position-relative">
                      <img
                        src={imagePreview}
                        alt="Category"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1 rounded-circle"
                        style={{ transform: 'translate(30%, -30%)', lineHeight: 1 }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiImage size={36} className="text-muted mb-2" />
                      <p className="text-muted mb-2" style={{ fontSize: 'var(--font-size-sm)' }}>
                        Upload category image
                      </p>
                    </div>
                  )}

                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleImageChange}
                    className="mt-2"
                    size="sm"
                  />
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <Button variant="outline-secondary" onClick={closeModal} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="btn-primary-custom"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="me-2" />
                {editing ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCategories;
