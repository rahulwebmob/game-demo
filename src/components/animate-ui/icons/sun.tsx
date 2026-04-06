import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type SunProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, 180], transition: { duration: 0.7, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunProps) {
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
        cx={12} cy={12} r={4}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 2v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 20v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m4.93 4.93 1.41 1.41"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m17.66 17.66 1.41 1.41"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12h2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20 12h2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m6.34 17.66-1.41 1.41"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m19.07 4.93-1.41 1.41"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Sun(props: SunProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Sun,
  Sun as SunIcon,
  type SunProps,
};
