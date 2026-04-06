import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type LightbulbProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1, opacity: 1 }, animate: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LightbulbProps) {
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
        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9 18h6"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 22h4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Lightbulb(props: LightbulbProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Lightbulb,
  Lightbulb as LightbulbIcon,
  type LightbulbProps,
};
