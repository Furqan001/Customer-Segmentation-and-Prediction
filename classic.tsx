/**
 *
 * Input
 *
 */
import capitalize from 'lodash/capitalize';
import omit from 'lodash/omit';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Animated,
  Keyboard,
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  // StyleProp,
  TextInputFocusEventData,
  // TextInputProps,
  View,
  // ViewStyle,
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

import SVG from '../../SVG';
import Text from '../../Text';
import TouchFeedback from '../../TouchFeedback';
import useColors from '../../useColors';
import { InputProps } from '../types';

import style from './style';

export type TextInputRef = RNTextInput;

// export interface InputProps extends Omit<TextInputProps, 'ref'> {
//   error?: string | React.ReactNode;
//   noMargin?: boolean;
//   startIcon?: Svg;
//   onStartIconPress?: () => void;
//   showConfirmIcon?: boolean;
//   textWrapperStyles?: StyleProp<ViewStyle>;
//   backgroundColor?: Color;
//   borderColor?: Color;
//   onClear?: () => void;
//   helperText?: string | React.ReactNode;
//   endComponent?: React.ReactNode;
//   compact?: boolean;
//   mask?: boolean;
//   maskInputType?: TextInputMaskTypeProp;
//   options?: TextInputMaskOptionProp;
//   hideKeyboardOnBlur?: boolean;
// }

const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);

const TextInput = React.forwardRef(
  ({ hideKeyboardOnBlur = true, ...props }: InputProps, ref: React.ForwardedRef<RNTextInput>) => {
    const colors = useColors();
    const localTextInputRef = React.useRef<RNTextInput>(null);
    const focusAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const [isFocussed, setIsFocussed] = React.useState<boolean>(false);

    const inputColors = useMemo(
      () => ({
        color: colors['text.primary'],
      }),
      [colors],
    );
    const onHideKeyboard = useCallback(() => {
      setIsFocussed(false);
      localTextInputRef.current?.blur();
    }, []);

    useEffect(() => {
      if (hideKeyboardOnBlur) {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onHideKeyboard);
        return () => keyboardDidHideListener.remove();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideKeyboardOnBlur]);

    const onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocussed(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocussed(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    // const onConfirmPress = (e: any) => {
    //   onBlur(e);
    //   localTextInputRef.current?.blur();
    // };

    useEffect(() => {
      Animated.timing(focusAnimatedValue, {
        toValue: isFocussed ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocussed]);

    const StartComp = useMemo(() => (props.onStartIconPress ? TouchFeedback : View), [props.onStartIconPress]);

    const commonProps = {
      placeholderTextColor: colors['text.secondary'],
      underlineColorAndroid: 'transparent',
      blurOnSubmit: true,
      onBlur: onBlur,
      onFocus: onFocus,
    };

    return (
      <View style={[style.wrapper, !props.noMargin && style.marginBottom, props?.textWrapperStyles]}>
        <View style={style.inputWrapper}>
          {props.mask ? (
            <TextInputMask
              {...props}
              {...commonProps}
              options={props.options}
              type={props.maskInputType!}
              // ref={ref as React.Ref<TextInputMask>}
              ref={(node) => {
                // @ts-expect-error -- multiRef
                const actualNode = node?.getElement?.();
                if (actualNode) {
                  if (ref) {
                    // @ts-expect-error -- multiRef
                    ref.current = actualNode;
                  }
                }
              }}
              style={[
                style.input,
                props.compact ? style.compact : {},
                inputColors,
                props.startIcon ? style.inputWithIcon : {},
                props.endComponent ? style.inputWithEnd : {},
                { borderColor: colors['grey.400'] },
                props.style,
                props.multiline ? style.multiline : {},
              ]}
            />
          ) : (
            <AnimatedTextInput
              clearButtonMode="never"
              {...omit(props, ['label', 'style', 'error', 'onBlur', 'onFocus', 'icon'])}
              {...commonProps}
              ref={(node) => {
                if (node) {
                  if (ref) {
                    // @ts-expect-error -- multiRef
                    ref.current = node;
                  }
                  // @ts-expect-error -- multiRef
                  localTextInputRef.current = node;
                }
              }}
              style={[
                style.input,
                props.compact ? style.compact : {},
                inputColors,
                props.startIcon ? style.inputWithIcon : {},
                props.endComponent ? style.inputWithEnd : {},
                //   props.error
                //     ? {
                //         borderColor: themeConfigs.colors.error,
                //       }
                //     : {},
                {
                  borderColor: focusAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors['grey.400'], colors['grey.600']],
                    extrapolate: 'clamp',
                  }),
                },
                props.style,
                props.multiline ? style.multiline : {},
              ]}
            />
          )}

          {props.endComponent || null}
        </View>
        {props.startIcon ? (
          <StartComp style={style.icon} onPress={props.onStartIconPress}>
            <SVG color="text.primary" title={props.startIcon} size={20} />
          </StartComp>
        ) : null}

        {props?.error ? (
          <Text color="error.main" style={style.error}>
            {typeof props.error === 'string' ? capitalize(props.error as string) : props.error}
          </Text>
        ) : null}
        {props.helperText ? (
          <Text style={style.helper} color="text.secondary">
            {props.helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

export default TextInput;
