import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import useComponentVisible from "@/hooks/useComponentVisible";
import toast from "react-hot-toast";

interface Position {
    x: number;
    y: number;
}

interface ConversationContextMenuProps {
    conversationId: Id<"conversations">;
    onClose: () => void;
    position: Position;
}

const ConversationContextMenu = ({ conversationId, onClose, position }: ConversationContextMenuProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteConversation = useMutation(api.conversations.deleteConversation);
    const { ref, isComponentVisible } = useComponentVisible(true);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isComponentVisible) {
            onClose();
        }
    }, [isComponentVisible, onClose]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteConversation({ conversationId });
            window.location.reload(); // Refresh to update the conversation list
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete conversation";
            console.error("Failed to delete conversation:", message);
            toast.error(message);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <div
            ref={ref}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
            }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
            >
                <Trash2 size={16} />
                <span className="text-sm">
                    {isDeleting ? "Deleting..." : "Delete Chat"}
                </span>
            </button>
        </div>
    );
};

export default ConversationContextMenu;
