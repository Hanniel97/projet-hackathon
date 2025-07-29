import React from 'react';
import { Alert } from '../../types';
import clsx from 'clsx';

interface AlertBadgeProps {
    alert: Alert;
    onClick?: () => void;
    showPatient?: boolean;
}

const alertConfig = {
    low: { color: 'bg-green-100 text-green-800 border-green-200', icon: '●' },
    info: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '●●' },
    warning: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '●●●' },
    critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: '●●●●' },
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({
    alert,
    onClick,
    showPatient = false
}) => {
    const config = alertConfig[alert.type];
    const patient = typeof alert.patient === 'object' ? alert.patient : null;

    return (
        <div
            onClick={onClick}
            className={clsx(
                'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                config.color,
                !alert.isRead && 'ring-2 ring-blue-200'
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-mono">{config.icon}</span>
                        <span className="text-xs font-medium uppercase tracking-wide">
                            {alert.priority}
                        </span>
                        {!alert.isRead && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                    </div>

                    <p className="text-sm font-medium mb-1">{alert.message}</p>

                    {showPatient && patient && (
                        <p className="text-xs opacity-75">
                            Patient: {patient.firstName} {patient.lastName}
                        </p>
                    )}

                    <p className="text-xs opacity-75">
                        {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};