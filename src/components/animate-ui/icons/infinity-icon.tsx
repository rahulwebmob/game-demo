import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type InfinityProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scaleX: 1 }, animate: { scaleX: [1, 1.1, 0.95, 1], transition: { duration: 0.6, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: InfinityProps) {
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
        d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Infinity(props: InfinityProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Infinity,
  Infinity as InfinityIcon,
  type InfinityProps,
};
