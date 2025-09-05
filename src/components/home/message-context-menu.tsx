import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import useComponentVisible from "@/hooks/useComponentVisible";

interface MessageContextMenuProps {
    messageId: Id<"messages">;
    isFromMe: boolean;
    onClose: () => void;
}

const MessageContextMenu = ({ messageId, isFromMe, onClose }: MessageContextMenuProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const { ref, isComponentVisible } = useComponentVisible(true);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isComponentVisible) {
            onClose();
        }
    }, [isComponentVisible, onClose]);

    const handleDelete = async () => {
        if (!isFromMe) return;
        
        setIsDeleting(true);
        try {
            await deleteMessage({ messageId });
            onClose();
        } catch (error) {
            console.error("Failed to delete message:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isFromMe) return null;

    return (
        <div ref={ref} className="absolute right-2 top-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
            >
                <Trash2 size={16} />
                <span className="text-sm">
                    {isDeleting ? "Deleting..." : "Delete"}
                </span>
            </button>
        </div>
    );
};

export default MessageContextMenu;
