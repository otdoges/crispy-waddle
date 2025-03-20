import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Emoji } from 'emoji-mart';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';

interface MessageProps {
  id: string;
  content: string;
  contentType: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    thumbnail?: string;
    name: string;
  }>;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
}

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 }
};

const reactionVariants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  hover: { scale: 1.2 }
};

export const EnhancedMessage: React.FC<MessageProps> = ({
  id,
  content,
  contentType,
  sender,
  timestamp,
  reactions,
  attachments,
  isEdited,
  replyTo
}) => {
  const { theme } = useTheme();
  const { user } = useUser();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      // Add reaction logic here
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case 'text/markdown':
        return (
          <ReactMarkdown className="prose dark:prose-invert">
            {content}
          </ReactMarkdown>
        );
      case 'text/x-url':
        return (
          <div className="link-preview rounded-lg overflow-hidden">
            {/* Link preview component */}
          </div>
        );
      default:
        return <p className="text-gray-200">{content}</p>;
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`message-container p-4 ${
        sender.id === user?.id ? 'ml-auto' : 'mr-auto'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        maxWidth: '70%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.radius,
        marginBottom: theme.spacing.gap
      }}
    >
      {replyTo && (
        <div className="reply-container text-sm text-gray-400 mb-2 border-l-2 border-primary pl-2">
          <span className="font-medium">{replyTo.sender}</span>
          <p className="truncate">{replyTo.content}</p>
        </div>
      )}

      <div className="message-header flex items-center gap-2 mb-2">
        <Image
          src={sender.avatar}
          alt={sender.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="font-medium text-gray-200">{sender.name}</span>
        <span className="text-sm text-gray-400">
          {format(timestamp, 'HH:mm')}
        </span>
        {isEdited && (
          <span className="text-xs text-gray-400 italic">(edited)</span>
        )}
      </div>

      <div className="message-content">{renderContent()}</div>

      {attachments && attachments.length > 0 && (
        <div className="attachments-container mt-2 grid grid-cols-2 gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="attachment rounded-lg overflow-hidden"
            >
              {attachment.type.startsWith('image') ? (
                <Image
                  src={attachment.url}
                  alt={attachment.name}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              ) : (
                <div className="file-attachment p-2 bg-gray-700 rounded">
                  <span>{attachment.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="reactions-container mt-2 flex flex-wrap gap-1"
          >
            {reactions.map((reaction) => (
              <motion.div
                key={reaction.emoji}
                variants={reactionVariants}
                whileHover="hover"
                className="reaction-badge flex items-center gap-1 bg-gray-700 rounded-full px-2 py-1"
              >
                <Emoji emoji={reaction.emoji} size={16} />
                <span className="text-sm">{reaction.count}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="message-actions absolute top-2 right-2 flex gap-2"
          >
            <button
              onClick={() => setShowReactionPicker(true)}
              className="action-button"
            >
              😀
            </button>
            <button className="action-button">↩️</button>
            <button className="action-button">⋮</button>
          </motion.div>
        )}
      </AnimatePresence>

      {showReactionPicker && (
        <div className="reaction-picker absolute bottom-full mb-2">
          {/* Emoji picker component */}
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedMessage; 