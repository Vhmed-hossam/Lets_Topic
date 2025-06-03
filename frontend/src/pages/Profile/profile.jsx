import { useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Camera,
  Mail,
  User,
  Pencil,
  X,
  Info,
  ChevronRight,
} from "lucide-react";
import SpecialLoader from "../../components/Spinner/specialloader.jsx";
import SmallLoader from "../../components/Spinner/smallloader.jsx";
import { ErrorToast } from "../../components/Toast/Toasters.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import profanityCleaner from "profanity-cleaner";
import { BookUser } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchImageAsBase64 } from "../../helpers/fetchImage64.js";
import { Avatars, defaultImage } from "../../Data/Avatars.js";
import formatDateOnly from "../../helpers/formatDateonly.js";
import { defaultBanner } from "../../Data/Banners.js";
import renderTextWithLinks from "../../helpers/renderTLink.jsx";
export default function Profile() {
  const {
    authUser,
    isUpdatingProfile,
    UpdateProfile,
    ChangeName,
    isUpdatingName,
    AddBanner,
    isaddingBanner,
    AddBio,
    isAddingBio,
  } = useAuthStore();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const [selectedImg, setSelectedImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(authUser?.user?.fullName || "");
  const [Bio, setBio] = useState(authUser?.user?.bio || "");
  const [isAddingBioo, setisAddingBioo] = useState(false);
  const handleProfilePicChange = async (input) => {
    setIsModalOpen(false);
    let imageToUse = "";
    if (typeof input === "string") {
      imageToUse = await fetchImageAsBase64(input);
    } else {
      const file = input.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/"))
        return ErrorToast("Invalid file type. Please upload an image.");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        try {
          await UpdateProfile({ profilePic: base64Image });
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }
      };
      return;
    }
    setSelectedImg(imageToUse);
    try {
      await UpdateProfile({ profilePic: imageToUse });
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };
  const handleNameChange = async () => {
    if (newName.trim() === authUser?.user?.fullName) {
      ErrorToast("No changes occured");
      setIsEditingName(false);
    } else {
      try {
        const cleanedText = await profanityCleaner.clean(newName);
        await ChangeName(authUser.user._id, { fullName: cleanedText.trim() });
        setIsEditingName(false);
      } catch (error) {
        console.error("Error updating name:", error);
      } finally {
        setIsEditingName(false);
        setNewName("");
      }
    }
  };
  const handleBannerChange = async (input) => {
    setIsModalOpen(false);
    if (typeof input === "string") {
      let imageToUse = "";
      imageToUse = await fetchImageAsBase64(input);
    } else {
      const file = input.target.files[0];
      if (!file) return ErrorToast("No file selected");
      if (!file.type.startsWith("image/"))
        return ErrorToast("Invalid file type. Please upload an image.");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedBanner(base64Image);
        try {
          await AddBanner({ banner: base64Image });
        } catch (error) {
          console.error("Error updating banner:", error);
        }
      };
    }
  };

  async function AddTheBio() {
    setisAddingBioo(true);
    if (Bio.trim() === authUser?.user?.bio) {
      ErrorToast("No changes occured");
      setisAddingBioo(false);
    } else {
      setisAddingBioo(true);
      try {
        const cleanedBio = await profanityCleaner.clean(Bio);
        await AddBio(authUser.user._id, { bio: cleanedBio.trim() });
      } catch (error) {
        console.log("Error updating bio:", error);
      } finally {
        setisAddingBioo(false);
        setBio("");
      }
    }
  }
  return (
    <div className="flex items-center justify-center mt-16">
      <div className="max-w-2xl p-3 w-full " ref={formRef}>
        <div className="space-y-4">
          <div className="p-4 space-y-8 bg-main/25 rounded-xl overflow-hidden">
            <div className="text-center w-full relative h-25">
              <div className="absolute h-50 w-full bg-black-full rounded-lg">
                {isaddingBanner && (
                  <div className="absolute top-0 left-0 w-full rounded-lg h-full bg-black/50 flex items-center justify-center">
                    <SpecialLoader />
                  </div>
                )}
                <img
                  src={
                    selectedBanner || authUser?.user?.banner || defaultBanner
                  }
                  alt="Banner"
                  className="w-full h-full object-cover rounded-lg"
                />
                <label
                  htmlFor="banner-upload"
                  className={`absolute bottom-2 right-2 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isaddingBanner ? "opacity-0" : ""
                  }`}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={isaddingBanner}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 ">
              <div className="relative">
                <img
                  src={selectedImg || authUser.user.profilePic || defaultImage}
                  alt="Avatar"
                  className={`size-32 text-center rounded-full object-cover border-2 grid place-items-center ${
                    isUpdatingProfile ? "border-second-shiny" : ""
                  }`}
                />
                {isUpdatingProfile && (
                  <div className="absolute top-0 left-0 w-full rounded-full h-full bg-black/50 flex items-center justify-center">
                    <SpecialLoader />
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isUpdatingProfile ? "opacity-0" : ""
                  }`}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <h1 className="text-2xl font-bold text-center text-second-shiny">
                {newName || authUser.user.fullName}
              </h1>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm  flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <div className="relative">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-4 py-2.5 bg-main-shiny/10 rounded-lg border w-full transition-all"
                      />
                      <button
                        onClick={handleNameChange}
                        className="bg-main hover:bg-main/85 transition-all p-2 rounded-lg disabled:bg-main/50 disabled:cursor-not-allowed"
                        disabled={!newName || newName === ""}
                      >
                        {isUpdatingName ? <SmallLoader /> : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(authUser?.user?.fullName);
                        }}
                        className="bg-side-text hover:bg-side-text/85 transition-all p-2 rounded-lg "
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="px-4 py-3 bg-main-shiny/10 rounded-lg border overflow-hidden">
                      {authUser?.user?.fullName}
                    </p>
                  )}
                  {!isEditingName && (
                    <button
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => {
                        setIsEditingName(true);
                        setNewName(authUser?.user?.fullName);
                      }}
                      aria-label="Edit Full Name"
                    >
                      <Pencil className="size-5 cursor-pointer text-second-shiny hover:text-second/85 transition-all " />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm  flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-3 bg-main-shiny/10 rounded-lg border overflow-hidden">
                  {authUser?.user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm  flex items-center gap-2">
                <Info className="w-4 h-4" />
                Bio
              </div>
              <div className="relative">
                {isAddingBioo ? (
                  <div
                    className="grid grid-cols-4 items-center gap-2"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    <textarea
                      value={Bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="px-4 py-2 resize-none bg-main-shiny/10 rounded-lg w-full transition-all h-25 col-span-3"
                      style={{ whiteSpace: "pre-line" }}
                    />
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={AddTheBio}
                        className="bg-main hover:bg-main/85 transition-all  p-2 rounded-lg disabled:bg-main/50 disabled:cursor-not-allowed"
                        disabled={Bio.length > 190}
                        onLoad={isAddingBioo}
                      >
                        {isAddingBio ? <SmallLoader /> : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setisAddingBioo(false);
                          setBio(authUser?.user?.bio);
                        }}
                        className="bg-side-text hover:bg-side-text/85 transition-all p-2 rounded-lg "
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 text-right col-span-4 me-3">
                      {190 - Bio.length}
                    </p>
                  </div>
                ) : (
                  <p
                    className={`px-4 py-2.5 h-25 bg-main-shiny/10 rounded-lg overflow-y-auto border overflow-hidden whitespace-pre-line ${
                      authUser?.user?.bio === "" && "text-gray-400"
                    }`}
                  >
                    {authUser?.user?.bio &&
                      renderTextWithLinks(authUser?.user?.bio)}
                    {authUser?.user?.bio === "" && "No bio..."}
                  </p>
                )}
                {!isAddingBioo && (
                  <button
                    className="absolute top-1/4 right-4 transform cursor-pointer -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => {
                      setisAddingBioo(true);
                      setBio(authUser?.user?.bio);
                    }}
                    aria-label="Add Bio"
                  >
                    <Pencil className="size-5 text-second-shiny hover:text-second/85 transition-all" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6 bg-main/10 rounded-md p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2">
                  <span>Member Since</span>
                  <span>{formatDateOnly(authUser?.user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-8 bg-main/25 rounded-xl overflow-hidden">
            <div className=" bg-main/10 rounded-md p-3">
              <div>
                <h2 className="text-lg font-medium mx-3 flex items-center justify-between">
                  Shop
                  <p className="text-sm ms-3 text-base-content/70">Beta</p>
                </h2>
                <p className="text-sm ms-3 text-base-content/70">
                  Check a bunch of ready Customized Avatars and banners
                </p>
              </div>
              <div className="space-y-3 p-3">
                <Link to="/shop">
                  <div className="flex items-center justify-between p-2 hover:bg-main/10 transition-all rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2 w-full p-2">
                      <BookUser />
                      <h2>View</h2>
                    </div>
                    <div>
                      <ChevronRight />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div>
          <div
            className="fixed inset-0 bg-black-full/40 flex items-center justify-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-black-full overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-2 relative"
            >
              <button
                className="absolute top-2 right-2 cursor-pointer text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-8 text-caution" />
              </button>

              <p className="text-second-shiny text-center mb-2">
                Choose Your Avatar
              </p>
              <div className="gap-5 p-2 flex flex-wrap justify-center items-center">
                {Avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer transition-transform"
                    onClick={() => selectedImg(avatar)}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index}`}
                      className={`rounded-full transition-transform hover:scale-105`}
                      onClick={() => handleProfilePicChange(avatar)}
                      setIsModalOpen={setIsModalOpen}
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
