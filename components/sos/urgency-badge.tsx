'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { UrgencyLevel } from '@/lib/services/sos';

interface UrgencyBadgeProps {
    urgency: UrgencyLevel;
    showIcon?: boolean;
    className?: string;
}

export function UrgencyBadge({ urgency, showIcon = true, className = '' }: UrgencyBadgeProps) {
    const urgencyConfig = {
        Critical: {
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: AlertCircle,
            label: 'Critical'
        },
        Urgent: {
            color: 'bg-orange-100 text-orange-800 border-orange-300',
            icon: AlertTriangle,
            label: 'Urgent'
        },
        Normal: {
            color: 'bg-blue-100 text-blue-800 border-blue-300',
            icon: Info,
            label: 'Normal'
        }
    };

    const config = urgencyConfig[urgency];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`${config.color} ${className}`}>
            {showIcon && <Icon className="h-3 w-3 mr-1" />}
            {config.label}
        </Badge>
    );
}
