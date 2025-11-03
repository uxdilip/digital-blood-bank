'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BLOOD_GROUPS } from '@/lib/constants';

interface BloodGroupSelectProps {
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
}

export function BloodGroupSelect({ value, onChange, required = false, disabled = false }: BloodGroupSelectProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="bloodGroup">
                Blood Group {required && <span className="text-red-600">*</span>}
            </Label>
            <Select value={value} onValueChange={onChange} disabled={disabled} required={required}>
                <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-red-600">{group}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                Select your blood group for donation matching
            </p>
        </div>
    );
}
