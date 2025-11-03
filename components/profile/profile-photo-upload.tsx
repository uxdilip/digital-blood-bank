'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadProfilePhoto, getProfilePhotoUrl, deleteProfilePhoto } from '@/lib/services/profile';
import { toast } from 'sonner';

interface ProfilePhotoUploadProps {
    currentPhotoId?: string;
    userName: string;
    onPhotoUpdate: (photoId: string | null) => void;
}

export function ProfilePhotoUpload({ currentPhotoId, userName, onPhotoUpdate }: ProfilePhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const photoUrl = currentPhotoId ? getProfilePhotoUrl(currentPhotoId) : preview;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const fileId = await uploadProfilePhoto(file);
            onPhotoUpdate(fileId);
            toast.success('Photo uploaded successfully!');
            setPreview(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload photo');
            setPreview(null);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!currentPhotoId) return;

        setDeleting(true);
        try {
            await deleteProfilePhoto(currentPhotoId);
            onPhotoUpdate(null);
            toast.success('Photo removed successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove photo');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="h-32 w-32">
                    {photoUrl ? (
                        <AvatarImage src={photoUrl} alt={userName} />
                    ) : (
                        <AvatarFallback className="bg-red-100 text-red-600 text-3xl">
                            {getInitials(userName)}
                        </AvatarFallback>
                    )}
                </Avatar>

                {(uploading || deleting) && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}

                <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                >
                    <Camera className="h-4 w-4" />
                </Button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Camera className="mr-2 h-4 w-4" />
                            {currentPhotoId ? 'Change Photo' : 'Upload Photo'}
                        </>
                    )}
                </Button>

                {currentPhotoId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={uploading || deleting}
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Remove
                            </>
                        )}
                    </Button>
                )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or WebP. Max size 5MB.
            </p>
        </div>
    );
}
