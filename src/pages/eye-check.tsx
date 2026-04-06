import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "../components/error-boundary";
import { useAppDispatch } from "../store/hooks";
import { fillEnergy } from "../store/player-slice";
import { addToast } from "../store/ui-slice";
import { useSound } from "../hooks/use-sound";

const PupilTest = lazy(() => import("../components/pupil-test"));

export default function EyeCheck() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sfx = useSound();

  return (
    <Suspense fallback={null}>
      <ErrorBoundary fallbackTitle="Eye check failed">
        <PupilTest
          onComplete={() => {
            dispatch(fillEnergy());
            dispatch(addToast({ message: "Energy restored! 5/5" }));
            sfx("success");
            navigate("/");
          }}
          onClose={() => navigate("/")}
          onError={(msg) => {
            dispatch(addToast({ message: msg }));
            navigate("/");
          }}
        />
      </ErrorBoundary>
    </Suspense>
  );
}
