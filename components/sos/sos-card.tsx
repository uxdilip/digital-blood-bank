'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplet, MapPin, Clock, Users } from 'lucide-react';
import { SOSRequest } from '@/lib/services/sos';
import { UrgencyBadge } from './urgency-badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface SOSCardProps {
    sos: SOSRequest & { distance?: number };
    showDistance?: boolean;
    showActions?: boolean;
    viewDetailsLink?: string;
    onRespond?: () => void;
    hasResponded?: boolean;
}

export function SOSCard({
    sos,
    showDistance = true,
    showActions = true,
    viewDetailsLink,
    onRespond,
    hasResponded = false
}: SOSCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-red-600" />
                            <span className="text-2xl font-bold text-red-600">
                                {sos.bloodGroup}
                            </span>
                            <Badge variant="secondary">
                                {sos.unitsNeeded} {sos.unitsNeeded === 1 ? 'Unit' : 'Units'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Blood Needed
                        </p>
                    </div>
                    <UrgencyBadge urgency={sos.urgency} />
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Hospital Info */}
                <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sos.hospitalName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {sos.hospitalAddress}
                        </p>
                    </div>
                </div>

                {/* Distance */}
                {showDistance && sos.distance !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{sos.distance.toFixed(1)} km away</span>
                    </div>
                )}

                {/* Time Posted */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                        {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true })}
                    </span>
                </div>

                {/* Response Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{sos.responseCount} {sos.responseCount === 1 ? 'donor has' : 'donors have'} responded</span>
                </div>

                {/* Medical Notes */}
                {sos.medicalNotes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {sos.medicalNotes}
                        </p>
                    </div>
                )}
            </CardContent>

            {showActions && (
                <CardFooter className="flex gap-2">
                    {viewDetailsLink && (
                        <Link href={viewDetailsLink} className="flex-1">
                            <Button variant="outline" className="w-full">
                                View Details
                            </Button>
                        </Link>
                    )}
                    {onRespond && !hasResponded && (
                        <Button
                            onClick={onRespond}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            I Can Help
                        </Button>
                    )}
                    {hasResponded && (
                        <Button variant="secondary" disabled className="flex-1">
                            Already Responded
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
