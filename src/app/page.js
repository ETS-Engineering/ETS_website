"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/HeroSection";

export default function Home() {
	const {user, loading } = useAuth();
	const router = useRouter();

	if(!loading && user) {
		console.log("user logged in"); //gestisci cosa fare quando una persona è loggata, set on qualcosa
		//return null;
	}

	return (
    <div className={` bg-secondary  font-sans grid grid-rows-[8fr_2fr] items-start justify-items-center h-svh`}>
      {loading ? <h1>Loading...</h1> : <HeroSection />}
    </div>
  );
}
