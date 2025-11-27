import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, User } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

export default function CommentsSheet({ isOpen, onClose, questionId, questionText }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const commentsEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && questionId) {
            fetchComments();
        }
    }, [isOpen, questionId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/comments/${questionId}`);
            setComments(res.data);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await axios.post('/comments', {
                questionId,
                text: newComment
            });
            setComments([...comments, res.data]);
            setNewComment('');
            scrollToBottom();
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <MessageCircle size={20} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Discussion</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Question Context */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 font-medium italic">
                                "{questionText}"
                            </p>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                                    <MessageCircle size={40} className="opacity-20" />
                                    <p>Aucun commentaire pour le moment.</p>
                                    <p className="text-sm">Soyez le premier à lancer la discussion !</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className={`flex gap-3 ${comment.user.id === user.id ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${comment.user.role === 'ADMIN' || comment.user.role === 'SUPER_ADMIN'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            <User size={14} />
                                        </div>
                                        <div className={`flex flex-col max-w-[80%] ${comment.user.id === user.id ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {comment.user.name || 'Utilisateur'}
                                                </span>
                                                {(comment.user.role === 'ADMIN' || comment.user.role === 'SUPER_ADMIN') && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                        Admin
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm ${comment.user.id === user.id
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                                }`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    disabled={submitting}
                                />
                                <Button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="rounded-xl px-4 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Send size={18} />}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
