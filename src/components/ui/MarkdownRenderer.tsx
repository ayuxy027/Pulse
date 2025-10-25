import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    style?: React.CSSProperties;
    // Text styling props to maintain compatibility
    fontFamily?: string;
    fontSize?: number;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    color?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className = '',
    style = {},
    fontFamily = 'Inter',
    fontSize = 14,
    isBold = false,
    isItalic = false,
    isUnderline = false,
    color = '#2c3e50'
}) => {
    // Combine custom styles with text styling props
    const combinedStyle: React.CSSProperties = {
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: '1.4',
        color,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style
    };

    // Custom components to maintain styling consistency
    const components: Components = {
        // Headers - Simple and formal
        h1: ({ children, ...props }) => (
            <h1 {...props} style={{
                fontSize: `${fontSize * 1.5}px`,
                fontWeight: '700',
                margin: '12px 0 8px 0',
                color: '#1f2937',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '8px'
            }}>
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 {...props} style={{
                fontSize: `${fontSize * 1.3}px`,
                fontWeight: '600',
                margin: '10px 0 6px 0',
                color: '#374151'
            }}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 {...props} style={{
                fontSize: `${fontSize * 1.1}px`,
                fontWeight: '600',
                margin: '8px 0 4px 0',
                color: '#4b5563'
            }}>
                {children}
            </h3>
        ),

        // Lists - Simple and clean
        ul: ({ children, ...props }) => (
            <ul {...props} style={{
                margin: '8px 0',
                paddingLeft: '20px'
            }}>
                {children}
            </ul>
        ),
        ol: ({ children, ...props }) => (
            <ol {...props} style={{
                margin: '8px 0',
                paddingLeft: '20px'
            }}>
                {children}
            </ol>
        ),
        li: ({ children, ...props }) => (
            <li {...props} style={{
                margin: '4px 0',
                lineHeight: '1.6',
                color: '#374151'
            }}>
                {children}
            </li>
        ),

        // Emphasis - Simple and formal
        strong: ({ children, ...props }) => (
            <strong {...props} style={{
                fontWeight: '600',
                color: '#1f2937'
            }}>
                {children}
            </strong>
        ),
        em: ({ children, ...props }) => (
            <em {...props} style={{
                fontStyle: 'italic',
                color: '#6b7280'
            }}>
                {children}
            </em>
        ),

        // Code
        code: ({ children, ...props }) => (
            <code {...props} style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: '2px 4px',
                borderRadius: '3px',
                fontFamily: 'monospace',
                fontSize: `${fontSize * 0.9}px`
            }}>
                {children}
            </code>
        ),

        // Paragraphs
        p: ({ children, ...props }) => (
            <p {...props} style={{
                margin: '8px 0',
                lineHeight: '1.7',
                color: '#374151',
                fontSize: `${fontSize}px`
            }}>
                {children}
            </p>
        ),

        // Blockquotes
        blockquote: ({ children, ...props }) => (
            <blockquote {...props} style={{
                borderLeft: '3px solid #ddd',
                margin: '2px 0',
                paddingLeft: '8px',
                fontStyle: 'italic',
                color: 'rgba(44,62,80,0.7)'
            }}>
                {children}
            </blockquote>
        ),
    };

    return (
        <div className={className} style={combinedStyle}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
