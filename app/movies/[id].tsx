import { icons } from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { fetchMovieDetails } from "@/services/api";
import {
  addToFavorites,
  isMovieFavorite,
  removeFromFavorites,
} from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Session } from "@supabase/supabase-js";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (session && movie) {
        const favorite = await isMovieFavorite(session.user.id, movie.id);
        setIsFavorite(favorite);
      }
    };
    checkFavoriteStatus();
  }, [session, movie]);

  const handleFavoritePress = async () => {
    setIsFavorite(!isFavorite);

    if (!isFavorite) {
      Alert.alert("Added to Favorites! ⭐");
      if (session && movie)
        await addToFavorites(session?.user?.id, movie?.id.toString());
    } else {
      if (session && movie)
        await removeFromFavorites(session?.user?.id, movie?.id.toString());
      Alert.alert("Removed from Favorites");
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500/${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          {/* Favorite Star - Bottom Right Corner */}
          {session && session.user && (
            <Pressable
              onPress={handleFavoritePress}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderRadius: 20,
                padding: 8,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
              android_ripple={{ color: "#e5e7eb", borderless: true }}
            >
              <Image
                source={icons.star}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isFavorite ? "#fbbf24" : "#ffffff",
                }}
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />
          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${((movie?.revenue ?? 0) / 1_000_000).toFixed(3)} million`}
            />
          </View>
          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
