import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../../services/campaignService';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import CampaignWizard from '../../components/ai/CampaignWizard';
import { CAMPAIGN_CATEGORIES, SUGGESTED_TAGS_BY_CATEGORY } from '../../constants/categories';
import { DEPARTMENTS } from '../../constants/userTypes';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Banknote,
  Image as ImageIcon,
  Building2,
  Tag,
  ArrowLeft,
  GraduationCap,
  Plus,
  X,
  Hash,
  Upload,
  Link as LinkIcon,
  Check,
  RefreshCw,
  FileText,
  Paperclip,
  Trash2,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const STOCK_PRESETS = [
  {
    category: 'Technology & Robotics',
    label: 'Robotics & Hardware',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
  },
  {
    category: 'Medical & Healthcare',
    label: 'Medical & Biology Lab',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200',
  },
  {
    category: 'Campus & Education',
    label: 'Campus & Student Life',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
  },
  {
    category: 'Sustainability',
    label: 'Ecology & Clean Tech',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200',
  },
  {
    category: 'Engineering',
    label: 'Electronics & AI Lab',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
  },
  {
    category: 'Community & Aid',
    label: 'Healthcare Outreach',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
  },
];

const DOCUMENT_TYPE_OPTIONS = [
  'Department Approval Letter',
  'Student / Faculty ID',
  'Budget Proposal / Quotation',
  'Medical Certificate / Hospital Estimate',
  'Lab Safety / Ethics Clearance',
  'Other Supporting Document',
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Image selection state: 'upload' | 'stock' | 'url'
  const [imageMode, setImageMode] = useState('stock');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Institutional Verification Documents state
  const [documents, setDocuments] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPE_OPTIONS[0]);
  const [docDragging, setDocDragging] = useState(false);
  const [customDocUrl, setCustomDocUrl] = useState('');
  const [customDocName, setCustomDocName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Education',
      department: currentUser?.department || 'Computer Science & Engineering',
      goalAmount: '',
      description: '',
      image: STOCK_PRESETS[0].url,
    },
  });

  const selectedImage = watch('image');
  const selectedCategory = watch('category') || 'Education';
  const categorySuggestions = SUGGESTED_TAGS_BY_CATEGORY[selectedCategory] || [];

  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot be larger than 10MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        // Target dimensions for high-res web banner
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, 0.88);

        setValue('image', compressedDataUrl);
        setUploadedFileName(file.name);
        toast.success(`Image "${file.name}" processed and attached!`);
      };
      img.onerror = () => {
        setValue('image', rawDataUrl);
        setUploadedFileName(file.name);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleAddTag = (newTag) => {
    const cleanTag = newTag.replace(/^#/, '').trim();
    if (!cleanTag) return;
    if (tags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      toast.error(`Tag #${cleanTag} already added`);
      return;
    }
    if (tags.length >= 8) {
      toast.error('You can add up to 8 tags');
      return;
    }
    setTags([...tags, cleanTag]);
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Merge a batch of AI-suggested tags in one update. handleAddTag reads `tags` from
  // its closure, so calling it in a loop would drop every tag after the first.
  const handleApplySuggestedTags = (suggestedTags) => {
    const merged = [...tags];
    let skipped = 0;

    suggestedTags.forEach((tag) => {
      const cleanTag = String(tag).replace(/^#/, '').trim();
      if (!cleanTag) return;
      if (merged.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) return;
      if (merged.length >= 8) {
        skipped += 1;
        return;
      }
      merged.push(cleanTag);
    });

    setTags(merged);
    if (skipped > 0) {
      toast.error(`${skipped} suggested tag(s) skipped — you can have up to 8 tags`);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(customTagInput);
    }
  };

  const handleDocumentFile = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Document file size must be under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const formattedSize =
        file.size < 1024 * 1024
          ? `${Math.round(file.size / 1024)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const newDoc = {
        name: file.name,
        type: selectedDocType,
        size: formattedSize,
        url: dataUrl,
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [...prev, newDoc]);
      toast.success(`Attached "${file.name}" as ${selectedDocType}`);
    };
    reader.onerror = () => {
      toast.error('Failed to read document file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDocFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleDocumentFile(file);
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  const handleDocDrop = (e) => {
    e.preventDefault();
    setDocDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleDocumentFile(file);
  };

  const handleAddDocUrl = (e) => {
    e?.preventDefault?.();
    if (!customDocUrl.trim()) {
      toast.error('Please enter a valid document link URL.');
      return;
    }
    const name = customDocName.trim() || `${selectedDocType}.pdf`;
    const newDoc = {
      name,
      type: selectedDocType,
      size: 'Web Link',
      url: customDocUrl.trim(),
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setCustomDocUrl('');
    setCustomDocName('');
    toast.success(`Attached link as ${selectedDocType}`);
  };

  const handleRemoveDocument = (idxToRemove) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        tags,
        documents,
      };
      const created = await campaignService.createCampaign(payload, currentUser);
      toast.success('Campaign created successfully!');
      navigate(`/campaign/${created.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <PageHeader
        title="Create New Campaign"
        description="Launch a university fundraising initiative to power your research, lab, or campus project."
      >
        <Button variant="ghost" onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
          Cancel
        </Button>
      </PageHeader>

      <Card className="p-8 shadow-md border border-[#E5E7EB]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Creator Badge Header */}
          <div className="p-4 rounded-xl bg-[#007979]/5 border border-[#007979]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#007979] text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#007979] uppercase tracking-wider">
                Publishing as Verified Creator
              </p>
              <p className="text-sm font-bold text-[#1F2937]">
                {currentUser?.fullName} ({currentUser?.userType}) — {currentUser?.department}
              </p>
            </div>
          </div>

          {/* AI writing assistance — conversational, suggestions applied on explicit accept */}
          <CampaignWizard
            draft={{
              title: watch('title'),
              description: watch('description'),
              category: watch('category'),
              tags,
              goalAmount: watch('goalAmount'),
            }}
            onApplyTitle={(value) =>
              setValue('title', value, { shouldValidate: true, shouldDirty: true })
            }
            onApplyCategory={(value) =>
              setValue('category', value, { shouldValidate: true, shouldDirty: true })
            }
            onApplyDescription={(value) =>
              setValue('description', value, { shouldValidate: true, shouldDirty: true })
            }
            onApplyTags={handleApplySuggestedTags}
          />

          {/* Campaign Title */}
          <Input
            label="Campaign Title"
            placeholder="e.g. Autonomous Solar Shuttle or 3D Bioprinting Lab Expansion"
            error={errors.title?.message}
            register={register('title', {
              required: 'Campaign title is required',
              minLength: { value: 10, message: 'Title should be at least 10 characters' },
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <Dropdown
              label="Category (Broad Purpose)"
              icon={Tag}
              options={CAMPAIGN_CATEGORIES}
              error={errors.category?.message}
              placeholder=""
              register={register('category', {
                required: 'Please select a campaign category',
              })}
            />

            {/* Department */}
            <Dropdown
              label="Department"
              icon={Building2}
              options={DEPARTMENTS}
              error={errors.department?.message}
              placeholder=""
              register={register('department', {
                required: 'Please select department',
              })}
            />
          </div>

          {/* Multi-Tags Discovery Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-[#1F2937] flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#007979]" />
                Specific Tags & Keywords ({tags.length}/8)
              </label>
              <span className="text-xs text-[#6B7280]">Searched automatically in Explore</span>
            </div>

            {/* Active Tags Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#007979]/10 text-[#007979] border border-[#007979]/20"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-[#007979] hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">#</span>
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type specific tag (e.g. Microcontrollers, AI_ML) & press Enter"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddTag(customTagInput)}
                icon={Plus}
              >
                Add
              </Button>
            </div>

            {/* Recommended Tag Suggestions for Current Category */}
            {categorySuggestions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-[#6B7280] mb-1.5">
                  Suggested for <span className="font-semibold text-[#1F2937]">{selectedCategory}</span>:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categorySuggestions.map((suggested) => {
                    const isAdded = tags.some((t) => t.toLowerCase() === suggested.toLowerCase());
                    return (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => (isAdded ? handleRemoveTag(suggested) : handleAddTag(suggested))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#007979] text-white shadow-xs'
                            : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#007979] hover:text-[#007979]'
                        }`}
                      >
                        {isAdded ? `✓ #${suggested}` : `+ #${suggested}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Funding Goal Amount */}
          <Input
            label="Funding Goal (৳ BDT)"
            type="number"
            placeholder="e.g. 15000"
            icon={Banknote}
            error={errors.goalAmount?.message}
            register={register('goalAmount', {
              required: 'Funding goal amount is required',
              min: { value: 1000, message: 'Minimum funding goal is ৳1000' },
              max: { value: 10000000, message: 'Maximum goal is ৳10,000,000' },
            })}
          />

          {/* Description */}
          <Textarea
            label="Campaign Description & Story"
            placeholder="Describe your project goals, why it matters to the university community, and how funds will be spent..."
            rows={5}
            error={errors.description?.message}
            register={register('description', {
              required: 'Campaign description is required',
              minLength: { value: 30, message: 'Description must be at least 30 characters long' },
            })}
          />

          {/* Image Selection & Upload Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm font-bold text-[#1F2937] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#007979]" />
                  Campaign Cover Image
                </label>
                <p className="text-xs text-[#6B7280]">
                  High-quality visuals dramatically increase backer engagement and trust.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    imageMode === 'upload'
                      ? 'bg-white text-[#007979] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('stock')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    imageMode === 'stock'
                      ? 'bg-white text-[#007979] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E37434]" /> Recommended Stock
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    imageMode === 'url'
                      ? 'bg-white text-[#007979] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Image URL
                </button>
              </div>
            </div>

            {/* TAB 1: FILE UPLOAD DROPZONE */}
            {imageMode === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#007979] bg-[#007979]/5 scale-[1.01]'
                      : 'border-gray-300 bg-white hover:border-[#007979] hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1F2937]">
                        Click to browse or drag & drop your project photo
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Supports PNG, JPG, JPEG, WebP • <strong>File size cannot be larger than 10MB</strong>
                      </p>
                    </div>
                    {uploadedFileName && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mt-1">
                        <Check className="w-3.5 h-3.5" /> {uploadedFileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RECOMMENDED STOCK GALLERY */}
            {imageMode === 'stock' && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#6B7280]">
                  Select a high-resolution academic photography banner:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STOCK_PRESETS.map((preset, idx) => {
                    const isSelected = selectedImage === preset.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setValue('image', preset.url);
                          setUploadedFileName('');
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#007979] ring-2 ring-[#007979]/30 shadow-md'
                            : 'border-[#E5E7EB] hover:border-gray-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="w-full h-24 sm:h-28 bg-gray-100 overflow-hidden">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2 bg-white flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-[#1F2937] truncate">
                            {preset.label}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#007979] text-white flex items-center justify-center text-[10px] shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: DIRECT IMAGE URL */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  icon={LinkIcon}
                  error={errors.image?.message}
                  register={register('image', {
                    required: 'Image URL or uploaded photo is required',
                  })}
                />
                <p className="text-xs text-[#6B7280]">
                  Paste any direct HTTPS image link from Unsplash, university media servers, or cloud storage.
                </p>
              </div>
            )}

            {/* Selected Image Live Preview */}
            {selectedImage && (
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1F2937] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" /> Current Cover Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('image', STOCK_PRESETS[0].url);
                      setUploadedFileName('');
                      setImageMode('stock');
                    }}
                    className="text-[#007979] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset to default
                  </button>
                </div>
                <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-gray-100 shadow-xs">
                  <img
                    src={selectedImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = STOCK_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-lg">
                    {uploadedFileName ? `Custom Upload: ${uploadedFileName}` : 'Selected Campaign Banner'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Verification Documents Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-[#FFFDF8] border border-[#E5E7EB]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="block text-sm font-bold text-[#1F2937] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#007979]" />
                  Institutional Verification Documents
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007979]/10 text-[#007979] border border-[#007979]/20 uppercase tracking-wider">
                    Official Audit Dossier
                  </span>
                </label>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  To protect our university community against fraud, all campaigns undergo review by Campus Administrators.
                  Attach official proof such as Department Approval, Student/Faculty ID, or Budget Quotations.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 shrink-0">
                {documents.length} attached
              </span>
            </div>

            {/* Document Type Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-[#4B5563] block">
                1. Select Document Category to Attach:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DOCUMENT_TYPE_OPTIONS.map((typeOption) => {
                  const isSelected = selectedDocType === typeOption;
                  return (
                    <button
                      key={typeOption}
                      type="button"
                      onClick={() => setSelectedDocType(typeOption)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#007979] text-white shadow-xs'
                          : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#007979] hover:text-[#007979]'
                      }`}
                    >
                      {typeOption}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-[#4B5563] block">
                2. Upload File or Link for <span className="text-[#007979] font-bold">"{selectedDocType}"</span>:
              </label>
              
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDocDragging(true);
                }}
                onDragLeave={() => setDocDragging(false)}
                onDrop={handleDocDrop}
                onClick={() => docFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  docDragging
                    ? 'border-[#007979] bg-[#007979]/5 scale-[1.01]'
                    : 'border-gray-300 bg-white hover:border-[#007979] hover:bg-gray-50'
                }`}
              >
                <input
                  ref={docFileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp,.doc,.docx"
                  onChange={handleDocFileInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-[#007979]/10 text-[#007979] flex items-center justify-center">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-[#1F2937]">
                    Click to browse or drop file for <span className="text-[#007979]">{selectedDocType}</span>
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    PDF, PNG, JPG, Word • Up to 15MB
                  </p>
                </div>
              </div>

              {/* Or Direct Document Link */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Optional custom doc title (e.g. Dean_Endorsement.pdf)"
                  value={customDocName}
                  onChange={(e) => setCustomDocName(e.target.value)}
                  className="sm:w-1/3 px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
                />
                <input
                  type="url"
                  placeholder="Or paste institutional document link (e.g. Google Drive, university portal URL)"
                  value={customDocUrl}
                  onChange={(e) => setCustomDocUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#24B1B1]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDocUrl}
                  icon={Plus}
                >
                  Add Link
                </Button>
              </div>
            </div>

            {/* Attached Documents List */}
            <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
              <span className="text-xs font-bold text-[#1F2937] block">
                Attached Verification Files ({documents.length}):
              </span>

              {documents.length === 0 ? (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    No documents attached yet. While optional during initial submission, uploading department approvals and student IDs significantly accelerates campaign verification.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#007979]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#007979]/10 text-[#007979] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1F2937] truncate">{doc.name}</p>
                          <p className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                            <span className="font-semibold text-[#007979]">{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold text-[#007979] hover:underline"
                          >
                            Preview
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cta"
              size="lg"
              isLoading={loading}
              icon={Sparkles}
            >
              Create Campaign
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
