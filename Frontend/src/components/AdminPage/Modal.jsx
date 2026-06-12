import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) return null;
    return (
        <div>
            <div className="fixed bg-black opacity-70 top-0 bottom-0 right-0 left-0 z-[1000]" onClick={onClose}>
            </div>
            <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full ${maxWidth} p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1001] border border-transparent dark:border-slate-800 transition-colors`}>
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3 mb-4 transition-colors">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;