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
        // Headers
        h1: ({ children, ...props }) => (
            <h1 {...props} style={{
                fontSize: `${fontSize * 1.8}px`,
                fontWeight: '800',
                margin: '16px 0 12px 0',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                borderBottom: '4px solid #e5e7eb',
                paddingBottom: '12px',
                textAlign: 'center'
            }}>
                {children}
            </h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 {...props} style={{
                fontSize: `${fontSize * 1.4}px`,
                fontWeight: '700',
                margin: '16px 0 8px 0',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '12px 16px',
                borderRadius: '12px',
                borderLeft: '6px solid #3b82f6',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 {...props} style={{
                fontSize: `${fontSize * 1.2}px`,
                fontWeight: '600',
                margin: '12px 0 6px 0',
                color: '#4b5563',
                backgroundColor: '#f1f5f9',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: '3px solid #10b981'
            }}>
                {children}
            </h3>
        ),

        // Lists
        ul: ({ children, ...props }) => (
            <ul {...props} style={{
                margin: '12px 0',
                paddingLeft: '0',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                listStyle: 'none'
            }}>
                {children}
            </ul>
        ),
        ol: ({ children, ...props }) => (
            <ol {...props} style={{
                margin: '12px 0',
                paddingLeft: '0',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                listStyle: 'none'
            }}>
                {children}
            </ol>
        ),
        li: ({ children, ...props }) => (
            <li {...props} style={{
                margin: '8px 0',
                lineHeight: '1.7',
                color: '#374151',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                borderLeft: '4px solid #3b82f6',
                position: 'relative',
                paddingLeft: '32px'
            }}>
                <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%'
                }}></span>
                {children}
            </li>
        ),

        // Emphasis
        strong: ({ children, ...props }) => (
            <strong {...props} style={{
                fontWeight: '800',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '4px 8px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #f59e0b'
            }}>
                {children}
            </strong>
        ),
        em: ({ children, ...props }) => (
            <em {...props} style={{
                fontStyle: 'italic',
                color: '#6b7280',
                backgroundColor: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid #d1d5db'
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
