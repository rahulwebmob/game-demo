import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type GlassesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0 }, animate: { y: [0, -2, 1, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GlassesProps) {
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
      <motion.circle
        cx={6} cy={15} r={4}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={18} cy={15} r={4}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14 15a2 2 0 0 0-4 0"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Glasses(props: GlassesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Glasses,
  Glasses as GlassesIcon,
  type GlassesProps,
};
