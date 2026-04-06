import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type RocketProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0, x: 0 }, animate: { y: [0, -4, 0], x: [0, 2, 0], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: RocketProps) {
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
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Rocket(props: RocketProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Rocket,
  Rocket as RocketIcon,
  type RocketProps,
};
