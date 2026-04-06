import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type MoonProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, -15, 15, 0], transition: { duration: 0.7, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoonProps) {
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
        d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Moon(props: MoonProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Moon,
  Moon as MoonIcon,
  type MoonProps,
};
