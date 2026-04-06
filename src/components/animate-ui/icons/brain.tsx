import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type BrainProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.06, 0.97, 1.03, 1], transition: { duration: 0.8, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BrainProps) {
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
        d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17.599 6.5a3 3 0 0 0 .399-1.375"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.003 5.125A3 3 0 0 0 6.401 6.5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.477 10.896a4 4 0 0 1 .585-.396"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.938 10.5a4 4 0 0 1 .585.396"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 18a4 4 0 0 1-1.967-.516"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.967 17.484A4 4 0 0 1 18 18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Brain(props: BrainProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Brain,
  Brain as BrainIcon,
  type BrainProps,
};
