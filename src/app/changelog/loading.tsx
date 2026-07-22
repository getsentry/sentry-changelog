import { Fragment } from "react";
import { FeedSkeleton } from "./feedSkeleton";
import Header from "./header";

export default function Loading() {
  return (
    <Fragment>
      <Header loading />
      <FeedSkeleton />
    </Fragment>
  );
}
