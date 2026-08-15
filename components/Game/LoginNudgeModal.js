'use client';

import Link from 'next/link';

export default function LoginNudgeModal({ onDismiss }) {
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full text-center">
                <h3 className="font-display text-text text-lg mb-2">Nice run!</h3>
                <p className="text-textMuted text-sm mb-5">
                    Sign in to keep your 300 Par history across devices. You can keep playing without an account too.
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/signin"
                        className="py-2 px-4 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Sign In
                    </Link>
                    <button
                        onClick={onDismiss}
                        className="py-2 px-4 rounded-lg text-text border border-border hover:bg-surfaceHover transition-colors font-semibold"
                    >
                        Keep Playing
                    </button>
                </div>
            </div>
        </div>
    );
}
