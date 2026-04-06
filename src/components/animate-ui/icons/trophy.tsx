import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type TrophyProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0, scale: 1 }, animate: { y: [0, -4, 0], scale: [1, 1.1, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TrophyProps) {
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
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 22h16"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Trophy(props: TrophyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Trophy,
  Trophy as TrophyIcon,
  type TrophyProps,
};
