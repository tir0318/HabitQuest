import React, { useState } from 'react';
import { marked } from 'marked';

/**
 * Component to display Markdown notes with a toggle
 * @param {Object} props
 * @param {string} props.content - Markdown content
 * @param {boolean} props.initialExpanded - Whether the note is expanded by default
 */
export default function MarkdownNote({ content, initialExpanded = false }) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    if (!content || content.trim() === '') return null;

    // Configure marked to be safe
    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    const renderedContent = marked.parse(content);

    return (
        <div className={`markdown-note-container ${isExpanded ? 'expanded' : ''}`}>
            <button
                className="btn btn-small btn-text note-toggle"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
            >
                {isExpanded ? '🔼 備考を閉じる' : '🔽 備考を表示'}
            </button>
            {isExpanded && (
                <div
                    className="markdown-body rendered-notes"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
}
