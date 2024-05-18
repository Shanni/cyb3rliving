"use client";

import getSavedQuestions from "@/app/actions/getSavedQuestions";
import Button from "@/app/components/Button";
import { SafeUser } from "@/app/types";
import { DEFAULT_QUESTIONS } from "@/app/utils/constants";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  currentUser?: SafeUser | null;
  listingId: string;
  savedQuestions: Awaited<ReturnType<typeof getSavedQuestions>>;
};

const QuestionnaireClient = ({ savedQuestions, listingId }: Props) => {
  const [questions, setQuestions] = useState(() => {
    return DEFAULT_QUESTIONS.map((question) => {
      return {
        question: question,
        answer:
          savedQuestions.find((q) => q.question === question)?.answer ?? "",
      };
    });
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuestions((prev) => {
      const question = prev.find((q) => q.question === name);
      if (!question) {
        return prev;
      }
      return prev.map((q) => {
        if (q.question === name) {
          return { ...q, answer: value };
        }
        return q;
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !searchParams ||
      !searchParams.has("start") ||
      !searchParams.has("end")
    ) {
      toast.error("Please select a date range on the previous page");
      return;
    }
    const response = await axios.post("/api/reservations", {
      listingId: listingId,
      start: searchParams.get("start"),
      end: searchParams.get("end"),
      questions: questions,
    });
    if (response.status === 200) {
      toast.success("Your answers have been submitted");
      router.push(`/listings/${listingId}`);
    } else {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <h1 className="text-2xl">
        Help us know you better by answering the following questions
      </h1>
      <div>
        <p>
          It takes up to 48 hours for us to review your answers. We will get
          back to you as soon as possible
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        {questions.map((question) => (
          <div className="flex flex-col mb-2" key={question.question}>
            <label htmlFor={question.question}>{question.question}</label>
            <input
              className="px-2 py-1 border border-gray-300 rounded-md"
              type="text"
              name={question.question}
              value={question.answer}
              onChange={handleChange}
            />
          </div>
        ))}
        <Button label="Submit" />
      </form>
    </div>
  );
};

export default QuestionnaireClient;
