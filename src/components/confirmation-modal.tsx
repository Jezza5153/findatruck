'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            bg: 'bg-red-500/10',
            button: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: 'text-amber-500',
            bg: 'bg-amber-500/10',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
        default: {
            icon: 'text-blue-500',
            bg: 'bg-blue-500/10',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center mx-auto mb-4`}>
                                <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-semibold text-center text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-400 text-center mb-6">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-600"
                                    onClick={onCancel}
                                    disabled={loading}
                                >
                                    {cancelLabel}
                                </Button>
                                <Button
                                    className={`flex-1 ${styles.button}`}
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        confirmLabel
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook for easy usage
export function useConfirmation() {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'default';
        onConfirm: () => Promise<void> | void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: () => { },
    });

    const confirm = (options: {
        title: string;
        message: string;
        variant?: 'danger' | 'warning' | 'default';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: options.title,
                message: options.message,
                variant: options.variant || 'danger',
                onConfirm: async () => {
                    setState((s) => ({ ...s, isOpen: false }));
                    resolve(true);
                },
            });
        });
    };

    const cancel = () => {
        setState((s) => ({ ...s, isOpen: false }));
    };

    return {
        confirm,
        cancel,
        ConfirmationModal: (
            <ConfirmationModal
                isOpen={state.isOpen}
                title={state.title}
                message={state.message}
                variant={state.variant}
                onConfirm={state.onConfirm}
                onCancel={cancel}
            />
        ),
    };
}

export default ConfirmationModal;
