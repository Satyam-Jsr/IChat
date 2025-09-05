import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react"
import { DropdownMenuContent } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import Image from "next/image";
import { DialogClose, DialogHeader } from "../ui/dialog";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";

const MediaDropdown =()=>{
    const imageInput=useRef<HTMLInputElement>(null);
    const videoInput=useRef<HTMLInputElement>(null);
    const [selectedImage,setSelectedImage]=useState<File | null>(null);
    const [selectedVideo,setSelectedVideo]=useState<File | null>(null);

    const [isLoading,setIsLoading] = useState(false);

    const generateUploadUrl= useMutation(api.conversations.generateUploadUrl);
    const sendImage= useMutation(api.messages.sendImage);
    const sendVideo=useMutation(api.messages.sendVideo);
    const me=useQuery(api.users.getMe);
    const {selectedConversation}= useConversationStore();

    const handleSendImage = async () => {
        if (!selectedImage || !selectedConversation || !me) {
            toast.error("Cannot send image at this time");
            return;
        }

        setIsLoading(true);
        try {
            const postUrl = await generateUploadUrl();
            
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedImage.type },
                body: selectedImage
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
            }

            const { storageId } = await result.json();
            if (!storageId) {
                throw new Error("No storage ID returned from upload");
            }
            await sendImage({
                imgId: storageId,
                conversation: selectedConversation._id,
                sender: me._id
            });

            toast.success("Image sent successfully");
            setSelectedImage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send image";
            console.error("Failed to send image:", error);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendVideo= async () =>{
      if (!selectedVideo || !selectedConversation || !me) {
        toast.error("Missing required data for video upload");
        return;
      }

      setIsLoading(true);
      try{
        console.log("Starting video upload...", selectedVideo.name, selectedVideo.size);
        
        const postUrl= await generateUploadUrl();
        console.log("Got upload URL:", postUrl);
        
        const result= await fetch(postUrl,{
          method: 'POST',
          headers: {'Content-Type': selectedVideo.type},
          body: selectedVideo
        })

        console.log("Upload response:", result.status, result.statusText);

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
        }

        const {storageId}= await result.json();
        console.log("Got storage ID:", storageId);

        if (!storageId) {
          throw new Error("No storage ID returned from upload");
        }

        console.log("Sending video message...");
        await sendVideo({
          videoId: storageId,
          conversation: selectedConversation._id,
          sender: me._id
        })

        console.log("Video sent successfully");
        setSelectedVideo(null);
        toast.success("Video sent successfully");

      } catch(error) {
        const message = error instanceof Error ? error.message : "Failed to send video";
        toast.error(message);
        console.error("Video upload error:", error);
      }
      finally
      {
        setIsLoading(false);
      }

    }

    return (
        <>
        <input
        type='file'
        ref={imageInput}
        accept='image/*'
        onChange={(e)=> {
            if(e.target.files?.[0])
                {setSelectedImage(e.target.files![0]);
                    e.target.value="";
                } } }
        hidden
        />
        <input
        type='file'
        ref={videoInput}
        accept='video/*'
        onChange={(e)=>{
            if(e.target.files?.[0]){
                const file = e.target.files[0];
                // Check file size (limit to 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    toast.error("Video file too large. Please select a file smaller than 100MB.");
                    e.target.value = "";
                    return;
                }
                setSelectedVideo(file);
                e.target.value="";
            } 
        }}
        hidden
        />

        {selectedImage && (
            <MediaImageDialog
            isOpen={selectedImage !== null}
            onClose={()=> setSelectedImage(null)}
            selectedImage={selectedImage}
            isLoading={isLoading}
            handleSendImage={handleSendImage}
            />
        )}

        {selectedVideo && ( 
        <MediaVideoDialog
        isOpen={selectedVideo!==null}
        onClose={()=> setSelectedVideo(null)}
        selectedVideo={selectedVideo}
        isLoading={isLoading}
        handleSendVideo= {handleSendVideo} 
        />
        )}
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Plus className='text-gray-600 dark:text-gray-400'/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
            <DropdownMenuItem onClick={()=>imageInput.current!.click()}
                className="flex items-center gap-2 mt-1">
                <ImageIcon size={18} className='mr-1'/><span>Photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>videoInput.current!.click()}
                className="flex items-center gap-2 mt-1">
                <Video size={20} className='mr-1'/>
                <span>Video</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    );
};
export default MediaDropdown;

type MediaImageDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    selectedImage: File;
    isLoading: boolean;
    handleSendImage: ()=> void;
};

const MediaImageDialog =({isOpen, onClose , selectedImage, isLoading, handleSendImage}: MediaImageDialogProps)=>{
    const [renderedImage, setRenderedImage]= useState<string | null>(null);

    useEffect(()=> {
        if(!selectedImage) return;
    const reader= new FileReader();
    reader.onload=(e)=>setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
    },[selectedImage]);
return (
    <Dialog
    open={isOpen}
    onOpenChange={(isOpen)=> {
        if(!isOpen) {
            setRenderedImage(null);
            onClose();
        }
    }}
    >
            <DialogContent className="fixed inset-0 z-[9999] flex flex-col items-center bg-black/80 p-6">
        <DialogHeader className="w-full max-w-5xl relative">
          <DialogTitle className="mx-auto text-center">Image</DialogTitle>

              <DialogClose asChild>
            <button
    aria-label="Close"
    className="absolute top-0 right-0 py-2 px-6 text-lg text-gray-300 hover:text-white"
  >
    x
  </button>
          </DialogClose>
        </DialogHeader>

        <div className="mt-4 flex flex-1 items-center justify-center overflow-auto max-h-[70vh] w-full">
          {renderedImage && (
            <Image
              src={renderedImage}
              alt="selected"
              width={800}
              height={600}
              unoptimized
              className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md pointer-events-none"
            />
          )}
        </div>

        <Button
          className="mt-6 w-full max-w-5xl"
          disabled={isLoading || !renderedImage}
          onClick={handleSendImage}
        >
          {isLoading ? "Sending…" : "Send"}
        </Button>
      </DialogContent>
        </Dialog>
);
};

type MediaVideoDialogProps = {
    isOpen: boolean;
    onClose: ()=>void;
    selectedVideo: File;
    isLoading: boolean;
    handleSendVideo: ()=> void;
};
const MediaVideoDialog = ({ isOpen, onClose, selectedVideo, isLoading, handleSendVideo }: MediaVideoDialogProps) => {
  const [renderedVideo, setRenderedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVideo) return;
    const url = URL.createObjectURL(selectedVideo);
    setRenderedVideo(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedVideo]);
    return (
        <Dialog
        open={isOpen}
        onOpenChange={(isOpen)=>{
            if(!isOpen) onClose();
        }}>
           <DialogContent className="fixed inset-0 z-[9999] flex flex-col items-center bg-black/80 p-6">
        <DialogHeader className="w-full max-w-5xl relative">
          <DialogTitle className="mx-auto text-center">Video</DialogTitle>

          <DialogClose asChild>
            <button
    aria-label="Close"
    className="absolute top-0 right-0 py-2 px-6 text-lg text-gray-300 hover:text-white"
  >
    x
  </button>
          </DialogClose>
        </DialogHeader>
        <div className="mt-4 w-full flex justify-center">
          {renderedVideo && (
            <video
              src={renderedVideo}
              controls
              className="w-full max-h-[70vh] rounded-lg shadow-md"
            />
          )}
        </div>
        <Button className="mt-6 w-full max-w-5xl" disabled={isLoading || !renderedVideo}
        onClick={handleSendVideo}
        >
          {isLoading ? "Sending…" : "Send"}
        </Button>
      </DialogContent>
             
        </Dialog>
    );
};