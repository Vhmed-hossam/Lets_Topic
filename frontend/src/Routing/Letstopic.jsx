import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedAuthRoute, ProtectedRoute } from "../Auth/Protection";
import Layout from "../Layout/layout";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import Profile from "../pages/Profile/profile";
import Account from "../pages/Settings/Children/Account";
import Appearance from "../pages/Settings/Children/Appearance";
import Settings from "../pages/Settings/settings";
import Signup from "../pages/Signup/signup";
import VerifyEmail from "../pages/VerifyEmail/verify-email";
import ProfileCombos from "../pages/Shop/ProfileCombos";
import Notifications from "../pages/Notifications/Notifications";
import Friends from "../pages/Friends/Friends";
import AddFriend from "../pages/Add Friend/AddFriend";
import VerifyandChange from "../pages/verifychange/VerifyandChange";
import DeleteAccount from "../pages/Delete Account/DeleteAcc";
import Resetpassword from "../pages/Resset Pass/Resetpassword";
import ConfirmDisable from "../pages/Disable Acc/ConfirmDisable";
import Privacy from "../pages/Privacy/privacy";
import AllFriends from "../pages/Privacy/Children/AllFriends";
import AllBlocked from "../pages/Privacy/Children/AllBlocked";

const letstopic = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/login",
        element: (
          <ProtectedAuthRoute>
            <Login />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <ProtectedAuthRoute>
            <Signup />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "account",
            element: (
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            ),
          },
          {
            path: "appearance",
            element: (
              <ProtectedRoute>
                <Appearance />
              </ProtectedRoute>
            ),
          },
          {
            path: "privacy",
            element: (
              <ProtectedRoute>
                <Privacy />
              </ProtectedRoute>
            ),
            children: [
              {
                path: "all-friends",
                element: (
                  <ProtectedRoute>
                    <AllFriends />
                  </ProtectedRoute>
                ),
              },
              {
                path: "all-blocked",
                element: (
                  <ProtectedRoute>
                    <AllBlocked />
                  </ProtectedRoute>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },

      {
        path: "/verify-email",
        element: (
          <ProtectedAuthRoute>
            <VerifyEmail />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "/shop",
        element: (
          <ProtectedRoute>
            <ProfileCombos />
          </ProtectedRoute>
        ),
      },

      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },
      {
        path: "/friends",
        element: (
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        ),
      },
      {
        path: "/add-friend",
        element: (
          <ProtectedRoute>
            <AddFriend />
          </ProtectedRoute>
        ),
      },
      {
        path: "/change-password",
        element: (
          <ProtectedRoute>
            <VerifyandChange />
          </ProtectedRoute>
        ),
      },
      {
        path: "/confirm-delete-account",
        element: (
          <ProtectedRoute>
            <DeleteAccount />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <ProtectedAuthRoute>
            <Resetpassword />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "/confirm-disable-account",
        element: (
          <ProtectedRoute>
            <ConfirmDisable />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default letstopic;