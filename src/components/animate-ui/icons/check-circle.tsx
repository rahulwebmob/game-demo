import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type CheckCircleProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.1, 1], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CheckCircleProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m9 11 3 3L22 4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CheckCircle(props: CheckCircleProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  CheckCircle,
  CheckCircle as CheckCircleIcon,
  type CheckCircleProps,
};
