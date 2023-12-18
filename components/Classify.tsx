"use client";
import { useState, useEffect, useRef } from "react";
import { useUpdateEffect } from "usehooks-ts";
import { useCompletion } from "ai/react";

import Sprite from "./Sprite";

interface ClassifyProps {
  studentGrade: number;
  studentTopic: string;
}

export default function Classify(props: ClassifyProps) {
  // On first render
  useEffect(() => {
    newSentence();
  }, []);

  // Audio player
  const sounds = ["/sounds/incorrect.mp3", "/sounds/correct.mp3"];
  const audioPlayer = useRef<HTMLAudioElement>(null);

  // Get a random Class answer and request a Sentence question
  const [currentSentenceClass, setCurrentSentenceClass] = useState<string>("");

  const sentenceClasses = [
    "Declerative",
    "Imperative",
    "Interrogative",
    "Exclamatory",
  ];

  function newSentence() {
    setIsAnswered(false);

    let randomSentenceClass;
    do {
      randomSentenceClass =
        sentenceClasses[Math.floor(Math.random() * sentenceClasses.length)];
    } while (randomSentenceClass === currentSentenceClass);

    setCurrentSentenceClass(randomSentenceClass);
  }

  useUpdateEffect(() => {
    if (currentSentenceClass) {
      sentenceComplete(sentencePrompt);
    }
  }, [currentSentenceClass]);

  // Question answering, and start points
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [starCount, setStarCount] = useState<number>(0);

  function answer(answer: string) {
    setCurrentAnswer(answer);
    setIsAnswered(true);

    if (answer == currentSentenceClass) {
      if (audioPlayer.current) {
        audioPlayer.current.src = sounds[1];
        audioPlayer.current.play();
      }

      setStarCount(starCount + 1);
    } else {
      if (audioPlayer.current) {
        audioPlayer.current.src = sounds[0];
        audioPlayer.current.play();
      }
    }
  }

  useUpdateEffect(() => {
    if (currentAnswer) {
      feedbackComplete(feedbackPrompt);
    }
  }, [currentAnswer]);

  // Prompts
  const sentencePrompt = `Write a short ${
    props.studentGrade
  }th grade level sentence that must be of sentence type ${currentSentenceClass.toLowerCase()} and include niche details about ${
    props.studentTopic
  }.`;
  const {
    complete: sentenceComplete,
    completion: sentenceCompletion,
    isLoading: sentenceIsLoading,
  } = useCompletion({
    api: "/api/getCompletion",
    onFinish(prompt) {
      console.log(prompt);
    },
  });

  const feedbackPrompt = `A ${
    props.studentGrade
  }th grader just answered that the following sentence is ${currentAnswer.toLowerCase()}, please give them the shortest possible feedback to why they are right or wrong, be encouraging... ${currentSentenceClass}: ${sentenceCompletion}`;
  const {
    complete: feedbackComplete,
    completion: feedbackCompletion,
    isLoading: feedbackIsLoading,
  } = useCompletion({
    api: "/api/getCompletion",
    onFinish(prompt) {
      console.log(prompt);
    },
  });

  // Animation control
  const [animationIndex, setAnimationIndex] = useState<number>(0);

  useUpdateEffect(() => {
    if (feedbackIsLoading == true) {
      setAnimationIndex(1);
    } else {
      setAnimationIndex(0);
    }
  }, [feedbackIsLoading]);

  return (
    <div className="flex h-full flex-col content-between bg-blue-50">
      <audio ref={audioPlayer} src={sounds[0]} />

      <div className="mt-8">
        <h1 className="text-center text-2xl font-semibold">
          Classify - Level {props.studentGrade}
        </h1>
        <h2 className="text-center text-xl italic">{props.studentTopic}</h2>
      </div>

      <div className="flex h-2/3 flex-col items-center justify-center space-y-4">
        <h2 className="max-w-xl  text-center text-xl font-bold text-blue-700">
          Is the following sentence declarative, imperative, interrogative, or
          exclamatory?
        </h2>

        <div className="flex h-24 items-center justify-center p-2">
          <h2 className="h-fit max-w-xl rounded-2xl bg-blue-700 p-2 px-4 text-center text-white">
            {sentenceCompletion}
          </h2>
        </div>

        <div className="flex select-none flex-col items-center space-y-4 text-white">
          <div className="flex flex-wrap justify-center gap-4">
            {sentenceClasses.map((sentenceClass, i) => (
              <button
                className={` rounded-full bg-gray-500 p-2 px-4 ${
                  isAnswered ? "" : " cursor-pointer hover:brightness-75"
                } ${
                  isAnswered && sentenceClass == currentSentenceClass
                    ? "bg-green-500"
                    : ""
                }
                ${
                  isAnswered && sentenceClass != currentSentenceClass
                    ? "bg-red-500"
                    : ""
                }`}
                disabled={isAnswered || sentenceIsLoading}
                onClick={() => answer(sentenceClass)}
                key={i}
              >
                {sentenceClass}
              </button>
            ))}
          </div>

          <button
            className={`w-fit rounded-full bg-gray-500 p-2 px-4 ${
              !isAnswered ? "opacity-25" : "cursor-pointer hover:brightness-75"
            }`}
            disabled={!isAnswered || feedbackIsLoading}
            onClick={() => newSentence()}
          >
            Next Sentence
          </button>
        </div>
      </div>

      <div className="flex w-full justify-center bg-blue-200 py-4">
        <h2 className="ml-[5.5rem] h-fit w-80 rounded-t-2xl rounded-bl-2xl bg-blue-50 p-2 px-4">
          {isAnswered
            ? feedbackCompletion
            : "You got this! I'll be here to give you feedback when you answer!"}
        </h2>

        <div className="-ml-[5.5rem]">
          <Sprite
            src="/sprites/frog_front.png"
            width={350}
            height={350}
            frameStart={0}
            frameEnd={2}
            fps={2}
            loop={true}
            isPlaying={animationIndex == 0}
            isHidden={animationIndex !== 0}
          />
          <Sprite
            src="/sprites/frog_front.png"
            width={350}
            height={350}
            frameStart={5}
            frameEnd={9}
            fps={5}
            loop={true}
            isPlaying={animationIndex == 1}
            isHidden={animationIndex !== 1}
          />
        </div>
      </div>
    </div>
  );
}
