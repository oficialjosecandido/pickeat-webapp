import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import "react-loading-skeleton/dist/skeleton.css";
import "@styles/globals.css";
import "react-medium-image-zoom/dist/styles.css";
import ModalContext from "@context/ModalContext";
import UserContext from "@context/UserContext";
import DataContext from "@context/DataContext";
import "normalize.css";

const Modal = dynamic(() => import("@components/Modal"), { ssr: false });
const Navbar = dynamic(() => import("@components/Navbar"), { ssr: false });

export const metadata = {
  title: "PickEat | Order Food from Your Seat",
  description:
    "Experience convenience with PickEat. Browse menus, order food, and get it delivered to your seat or ready for pickup—all while enjoying the game.",
  keywords:
    "PickEat, stadium food, food delivery, food pickup, sports venue dining, in-seat delivery, fast service, mobile ordering, stadium restaurants.",
  alternates: {
    canonical: "https://pickeat.com/",
  },
  charset: "UTF-8",
  robots: "index, follow",
  author: "PickEat Team",
  openGraph: {
    title: "PickEat | Order Food from Your Seat",
    description:
      "Experience convenience with PickEat. Browse menus, order food, and get it delivered to your seat or ready for pickup—all while enjoying the game.",
    url: `https://pickeat.com/`,
    type: "website",
    images: [
      {
        url: `https://pickeat.com/media/background.webp`,
        width: 1280,
        height: 720,
        alt: "PickEat",
      },
    ],
    site_name: "PickEat",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@PickEat",
    title: "PickEat | Order Food from Your Seat",
    description:
      "Experience convenience with PickEat. Browse menus, order food, and get it delivered to your seat or ready for pickup—all while enjoying the game.",
    image: "https://pickeat.com/media/background.webp",
  },
  colorScheme: "light only",
};

export default function RootLayout({ children }) {
  return (
    <html className="light" lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/static/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content="#ffffff"
        />
        <link rel="apple-touch-icon" href="/static/logo192.png" />
        <link rel="manifest" href="/static/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400;0,700;1,400;1,700&display=swap"
            rel="stylesheet"
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MKGFP49N');`,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MKGFP49N"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <ModalContext>
          <UserContext>
            <DataContext>
              <Navbar>
                <main>{children}</main>
              </Navbar>
              <Modal />
            </DataContext>
          </UserContext>
        </ModalContext>
        <ToastContainer />
      </body>
    </html>
  );
}
