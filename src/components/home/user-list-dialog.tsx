import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { error } from "console";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import { useConversationStore } from "@/store/chat-store";

const UserListDialog = () => {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef=useRef<HTMLButtonElement>(null);

  const createConversation= useMutation(api.conversations.createConversation);
  const generateUploadUrl= useMutation(api.conversations.generateUploadUrl);
  const me=useQuery(api.users.getMe);
  const users=useQuery(api.users.getUsers);

  const {setSelectedConversation}= useConversationStore();

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0 || isLoading) return;
    setIsLoading(true);
    try {
        const isGroup = selectedUsers.length > 1;

        // For groups, require a group name
        if (isGroup && !groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        let conversationId;
        if (!isGroup)
        {
            if (!me?._id) {
                throw new Error("User not found");
            }
            conversationId=await createConversation({
                participants: [...selectedUsers, me._id],
                isGroup:false
            })
        }
        else{

            const postUrl = await generateUploadUrl();

            const result= await fetch(postUrl,{
                method: "POST",
                headers: {"Content-Type": selectedImage?.type || 'image/jpeg'},
                body: selectedImage,
            });
            const {storageId}= await result.json();

            if (!me?._id) {
                throw new Error("User not found");
            }
            conversationId= await createConversation({
                participants: [...selectedUsers, me._id],
                isGroup: true,
                admin: me._id,
                groupName,
                groupImage: storageId,
            });
        }

        dialogCloseRef.current?.click();
            setSelectedUsers([]);
            setGroupName("");
            setSelectedImage(null);

          const name = isGroup ? groupName : users?.find((user)=> user._id === selectedUsers[0])?.name;
          setSelectedConversation({
            _id: conversationId,
            participants: selectedUsers,
            isGroup,
            image: isGroup ? renderedImage : users?.find((user)=>user._id === selectedUsers[0])?.image,
            admin: me?._id,
          });
        }
    catch(err)
    {
        toast.error("Failed to create conversation");
        console.error(err);
    }
    finally
    {
        setIsLoading(false);
    }

  }

  useEffect(()=>{
    if(!selectedImage) return setRenderedImage("");
    const Reader=new FileReader();
    Reader.onload= (e)=> setRenderedImage(e.target?.result as string);
    Reader.readAsDataURL(selectedImage);
  },[selectedImage]);
  return (
    <Dialog>
      <DialogTrigger>
        <MessageSquareDiff size={20} />
      </DialogTrigger>

      <DialogContent 
        className="bg-card text-foreground"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isLoading && selectedUsers.length > 0 && 
              (selectedUsers.length === 1 || (selectedUsers.length > 1 && groupName.trim()))) {
            e.preventDefault();
            handleCreateConversation();
          }
        }}
      >
        <DialogHeader>
            <DialogClose ref={dialogCloseRef}/>
          {/* TODO: <DialogClose /> */}
          <DialogTitle>USERS</DialogTitle>
        </DialogHeader>

        <DialogDescription>Start a new chat</DialogDescription>

        {renderedImage && (
          <div className="w-16 h-16 relative mx-auto">
            <Image
              src={renderedImage}
              fill
              alt="user image"
              className="rounded-full object-cover"
            />
          </div>
        )}

        <input
        type="file"
        accept="image/*"
        ref={imgRef}
        hidden
        onChange={(e)=>setSelectedImage(e.target.files![0])}
        />


        {selectedUsers.length > 1 && (
          <>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button 
  variant="outline" 
  className="flex gap-2 border border-border text-foreground" onClick={()=>imgRef.current?.click()}
>
  <ImageIcon className="text-foreground" size={20} />
  Group Image
</Button>


          </>
        )}

        <div className="flex flex-col gap-3 overflow-auto max-h-60">
          {users?.map((user) => {
            const isSelected = selectedUsers.includes(user._id);
            return (
              <div
                key={user._id}
                className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 
                  transition-all ease-in-out duration-300
                  ${isSelected ? "bg-accent border-l-4 border-green-500" : "hover:bg-accent"}
                `}
                onClick={() => {
                  if (isSelected) {
                    setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                  } else {
                    setSelectedUsers([...selectedUsers, user._id]);
                  }
                }}
              >
                <Avatar className="overflow-visible">
                  {user.isOnline && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
                  )}
                  <AvatarImage
                    src={user.image}
                    className="rounded-full object-cover"
                  />
                  <AvatarFallback>
                    <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
                  </AvatarFallback>
                </Avatar>

                <div className="w-full ">
                  <div className="flex items-center justify-between">
                    <p className="text-md font-medium">
                      {user.name || user.email.split("@")[0]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button variant={"outline"}>Cancel</Button>
          <Button
          onClick={handleCreateConversation}
            disabled={
              selectedUsers.length === 0 ||
              (selectedUsers.length > 1 && !groupName) ||
              isLoading
            }
            className="bg-card hover:bg-muted text-black dark:text-white"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-foreground rounded-full animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListDialog;
