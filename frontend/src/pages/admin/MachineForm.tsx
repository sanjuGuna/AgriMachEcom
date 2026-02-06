import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { machineAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Tractors',
  'Harvesters',
  'Plows',
  'Seeders',
  'Sprayers',
  'Irrigation',
  'Other',
];

interface MachineFormData {
  name: string;
  category: string;
  price: string;
  description: string;
  stock: string;
}

const MachineForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<MachineFormData>({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Fetch machine data for editing
  const { data: machineData, isLoading: machineLoading } = useQuery({
    queryKey: ['machine', id],
    queryFn: async () => {
      const response = await machineAPI.getById(id!);
      return response.data.machine || response.data;
    },
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (machineData) {
      setFormData({
        name: machineData.name || '',
        category: machineData.category || '',
        price: machineData.price?.toString() || '',
        description: machineData.description || '',
        stock: machineData.stock?.toString() || '',
      });
      setExistingImages(machineData.images || []);
    }
  }, [machineData]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + existingImages.length + files.length;
    
    if (totalImages > 4) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: 'You can only upload up to 4 images',
      });
      return;
    }

    const newImages = [...images, ...files].slice(0, 4 - existingImages.length);
    setImages(newImages);

    // Create preview URLs
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Revoke old URL and create new previews
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(newImages.map((file) => URL.createObjectURL(file)));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return machineAPI.create(data);
    },
    onSuccess: () => {
      toast({
        title: 'Machine created',
        description: 'The machine has been successfully added.',
      });
      navigate('/admin/machines');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create machine',
        description: error.response?.data?.message || 'An error occurred',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return machineAPI.update(id!, data);
    },
    onSuccess: () => {
      toast({
        title: 'Machine updated',
        description: 'The machine has been successfully updated.',
      });
      navigate('/admin/machines');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update machine',
        description: error.response?.data?.message || 'An error occurred',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        variant: 'destructive',
        title: 'Validation error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (!isEditing && images.length < 1) {
      toast({
        variant: 'destructive',
        title: 'Images required',
        description: 'Please upload at least 1 image',
      });
      return;
    }

    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('category', formData.category);
    formPayload.append('price', formData.price);
    formPayload.append('description', formData.description);
    formPayload.append('stock', formData.stock);

    // Append images
    images.forEach((image) => {
      formPayload.append('images', image);
    });

    // For editing, also send existing images to keep
    if (isEditing) {
      formPayload.append('existingImages', JSON.stringify(existingImages));
    }

    if (isEditing) {
      updateMutation.mutate(formPayload);
    } else {
      createMutation.mutate(formPayload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && machineLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/machines')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Machines
          </Button>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Machine' : 'Add New Machine'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Machine Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter machine name"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Enter price"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="Enter stock quantity"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter machine description"
                  rows={4}
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <Label>Images (3-4 recommended) *</Label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {images.length + existingImages.length < 4 && (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload images
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {4 - images.length - existingImages.length} slots remaining
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/machines')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...' }
                    </>
                  ) : isEditing ? (
                    'Update Machine'
                  ) : (
                    'Create Machine'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
};

export default MachineForm;
