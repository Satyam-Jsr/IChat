import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import useComponentVisible from "@/hooks/useComponentVisible";

interface ConversationContextMenuProps {
    conversationId: Id<"conversations">;
    onClose: () => void;
}

const ConversationContextMenu = ({ conversationId, onClose }: ConversationContextMenuProps) => {
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
            onClose();
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div ref={ref} className="absolute right-2 top-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
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
