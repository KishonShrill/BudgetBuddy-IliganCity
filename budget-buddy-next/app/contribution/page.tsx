"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ThumbsUp, ThumbsDown, Plus, Clock, Store, Tag,
    PackageOpen, CheckCircle2, Loader2, AlertCircle, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import ContributionGuideModal from './ContributionGuideModal';
import useFetchPendingContributions from '@/hooks/useFetchPendingContributions';
import useVoteContribution from '@/hooks/useVoteContribution';
import { useToast } from '@/components/ToastProvider';

export default function CommunityHub() {
    const router = useRouter();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('to_review');
    const [voteLoading, setVoteLoading] = useState(false);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

    const { data = { pending: [], votesToday: 0, submissionsToday: 0 }, isLoading, isError, error } = useFetchPendingContributions();
    const { mutate: submitVote } = useVoteContribution();

    const pendingItems = data.pending;

    // If myVote is null, they haven't voted. If it has a value ('up'/'down'), they have.
    const toReviewList = pendingItems.filter((item: any) => !item.myVote);
    const votedList = pendingItems.filter((item: any) => item.myVote);

    // Track daily votes
    const votesToday = data.votesToday;
    const submissionsToday = data.submissionsToday;
    const activeList = activeTab === 'to_review' ? toReviewList : votedList;
    const MAX_VOTES = 5;
    const MAX_SUBMISSION = 1;

    const isSubmissionBlocked = isError || submissionsToday >= MAX_SUBMISSION;

    async function handleVote(id: string, type: string) {
        if (votesToday >= MAX_VOTES) {
            addToast(
                "Limit reached",
                "You've reached your 5 votes for today! Come back tomorrow...",
                "destructive"
            );
            return;
        }

        setVoteLoading(true);
        submitVote(
            { id, voteType: type },
            {
                onSuccess: () => {
                    addToast(
                        "Vote submitted",
                        "Thanks for helping the community!",
                        "success"
                    );
                    setVoteLoading(false);
                },
                onError: (error: any) => {
                    addToast(
                        "Vote Error",
                        error.response?.data?.message || "Failed to submit vote",
                        "destructive"
                    );
                    setVoteLoading(false);
                }
            }
        );
    }

    useEffect(() => {
        // Check localStorage on component mount
        const hasSeen = localStorage.getItem("budgetbuddy_hasSeenGuide");
        if (!hasSeen) {
            setIsGuideModalOpen(true);
        }
    }, []);

    const renderCard = (item: any, isVotedTab: boolean, isVoting: boolean) => (
        <div key={item.id} className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm relative overflow-hidden transition-colors ${isVotedTab ? 'border-gray-200 dark:border-gray-700 opacity-80' : 'border-yellow-200 dark:border-yellow-600/50'}`}>

            <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center ${isVotedTab ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'}`}>
                {isVotedTab ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {isVotedTab ? 'Voted' : 'Pending'}
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 pr-16 leading-tight">{item.name}</h3>

            <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center"><Store className="w-4 h-4 mr-2 text-gray-400" /> {item.location.name}</span>
                <span className="flex items-center"><Tag className="w-4 h-4 mr-2 text-gray-400" /> {`${item.category.list} - ${item.category.catalog}`}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-end justify-between">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Reported Price</p>
                    <p className="text-2xl font-black text-orange-500">₱{item.price?.toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => !isVotedTab && handleVote(item.id, 'up')}
                        disabled={isVotedTab || isVoting}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${item.myVote === 'up' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 disabled:opacity-50'}`}
                    >
                        {isVoting && !isVotedTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                        <span className="text-sm font-bold">{item.upvotes}</span>
                    </button>
                    <button
                        onClick={() => !isVotedTab && handleVote(item.id, 'down')}
                        disabled={isVotedTab || isVoting}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${item.myVote === 'down' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50'}`}
                    >
                        {isVoting && !isVotedTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                        <span className="text-sm font-bold">{item.downvotes}</span>
                    </button>
                </div>
            </div>

            <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${((item.upvotes + item.downvotes) / 10) * 100}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{item.upvotes + item.downvotes}/10 votes reached</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-wrap md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Community Hub</h1>
                        <button
                            onClick={() => setIsGuideModalOpen(true)}
                            className="text-gray-400 hover:text-orange-500 transition-colors"
                            title="How it works"
                        >
                            <HelpCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Daily Progress Indicators */}
                    <div className='flex flex-wrap gap-x-2'>
                        <div className="items-center gap-3 mt-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm inline-flex">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Daily Votes:</span>
                            <div className="flex gap-1">
                                {[...Array(MAX_VOTES)].map((_, i) => (
                                    <div key={i} className={`w-6 h-2 rounded-full ${i < votesToday ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">{votesToday}/{MAX_VOTES}</span>
                        </div>
                        <div className="items-center gap-3 mt-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm inline-flex">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Daily Submissions:</span>
                            <div className="flex gap-1">
                                {[...Array(MAX_SUBMISSION)].map((_, i) => (
                                    <div key={i} className={`w-6 h-2 rounded-full ${i < submissionsToday ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">{submissionsToday}/{MAX_SUBMISSION}</span>
                        </div>
                    </div>
                </div>

                {/* Top Header Submit Button */}
                <Link href="/contribution/submit" className={`ml-auto self-end ${isSubmissionBlocked ? 'pointer-events-none' : ''}`}>
                    <Button
                        disabled={isSubmissionBlocked}
                        className={`bg-orange-500 hover:bg-orange-600 text-white shadow-md max-md:w-full disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:opacity-100`}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Submit New Price
                    </Button>
                </Link>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`cursor-pointer pb-3 px-6 text-sm font-bold transition-colors relative ${activeTab === 'to_review' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('to_review')}
                >
                    To Review ({toReviewList.length})
                    {activeTab === 'to_review' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
                </button>
                <button
                    className={`cursor-pointer pb-3 px-6 text-sm font-bold transition-colors relative ${activeTab === 'voted' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('voted')}
                >
                    My Votes ({votedList.length})
                    {activeTab === 'voted' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />}
                </button>
            </div>

            {/* CONDITIONAL RENDERING: Loading -> Error -> Empty State -> Grid */}
            {
                isLoading ? (
                    /* --- INLINE LOADING STATE --- */
                    <div className='flex items-center justify-center min-h-[40vh] py-20'>
                        <h2 className="text-lg font-medium dark:text-white">Loading community hub<span className="animated-dots"></span></h2>
                    </div>
                ) : isError ? (
                    /* --- INLINE ERROR STATE --- */
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-800/50 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Restricted</h2>
                        <p className="text-red-600 dark:text-red-400 font-medium max-w-md mb-8 leading-relaxed">
                            {error?.message || "You don't have permission to view or interact with this content."}
                        </p>
                        <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8" onClick={() => router.push('/')}>
                            Go Back Home
                        </Button>
                    </div>

                ) : activeList.length === 0 ? (
                    /* --- DYNAMIC EMPTY STATE FALLBACK --- */
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                            {activeTab === 'to_review' ? <PackageOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" /> : <CheckCircle2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {activeTab === 'to_review' ? "No Pending Approvals" : "You haven't voted yet"}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                            {activeTab === 'to_review'
                                ? "You're all caught up! There are currently no prices waiting for review."
                                : "Your voting history will appear here. Switch to the 'To Review' tab to start earning points!"}
                        </p>

                        {/* Fallback Submit Button */}
                        {activeTab === 'to_review' && (
                            <Link href="/contribution/submit" className={`${isSubmissionBlocked ? 'pointer-events-none' : ''}`}>
                                <Button
                                    disabled={isSubmissionBlocked}
                                    className={`bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8 disabled:bg-gray-400 disabled:dark:bg-gray-800 disabled:opacity-100`}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Make a Contribution
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    /* --- GRID OF ITEMS --- */
                    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-all duration-200 ${voteLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                        {activeList.map((item: any) => renderCard(item, activeTab === 'voted', voteLoading))}
                    </div>
                )
            }

            {/* Contribution Guide Modal */}
            <ContributionGuideModal
                isOpen={isGuideModalOpen}
                onClose={() => setIsGuideModalOpen(false)}
            />
        </div>
    );
}
