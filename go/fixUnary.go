// You can edit this code!
// Click here and start typing.
package main

import (
	"errors"
	"fmt"
)

func FixUnary(us_str string, stackBuilder []rune, rsltBuilder []rune) (rsltStr string, err error) {
	stacki := 0
	rslti := 0
	bracketCount := 0
	mayNeedOpenParen := false
	for _, c := range us_str {
		if c == '[' {
			if bracketCount > 0 {
				if rslti >= len(rsltBuilder) {
					return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
				}
				//rsltBuilder[rslti] = c
				//rslti++
			}
			bracketCount++
		} else if c == ']' {
			bracketCount--
			if bracketCount > 0 {
				if rslti >= len(rsltBuilder) {
					return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
				}
				//rsltBuilder[rslti] = c
				//rslti++
			}
		} else if bracketCount > 0 {
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = c
			rslti++
			continue
		}
		if mayNeedOpenParen && c != '(' && c != '[' {
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = '('
			rslti++
		}
		mayNeedOpenParen = false
		if c != ')' && c != ']' && c != '+' && c != '*' && c != '^' {
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = c
			rslti++
		}
		if c == 'e' || c == 'z' || c == 'h' || c == 'G' {
			mayNeedOpenParen = true
		}
		switch c {
		case 'e', 'z', 'h', 'G', '(', '[':
			if stacki >= len(stackBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of stackBuilder")
			}
			stackBuilder[stacki] = c
			stacki++
			//fmt.Printf("stacki: %v\n", stacki)
		case ')', ']', '+', '*', '^': //End of implicit unary Operator parenthesis
			stacki2 := stacki
			for ; stacki2-1 >= 0 && (stackBuilder[stacki2-1] == 'e' || stackBuilder[stacki2-1] == 'z' || stackBuilder[stacki2-1] == 'h' || stackBuilder[stacki2-1] == 'G'); stacki2-- {
				if rslti >= len(rsltBuilder) {
					return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
				}
				rsltBuilder[rslti] = ')'
				rslti++
			}
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = c
			rslti++

			//fmt.Printf("stack: %v, stacki2: %v\n", stack[:stacki], stacki2)
			if (c == ')' || c == ']') && stacki2-1 >= 0 && (stackBuilder[stacki2-1] == '(' || stackBuilder[stacki2-1] == '[') {
				fmt.Println("entered")
				stacki2--
				if stacki2-1 >= 0 && (stackBuilder[stacki2-1] == 'e' || stackBuilder[stacki2-1] == 'z' || stackBuilder[stacki2-1] == 'h' || stackBuilder[stacki2-1] == 'G') {
					fmt.Println("entered 2")
					stacki2--
				}
			}
			// implicitUnaryOpCount = stacki - stacki2 + 1
			stacki = stacki2
		}
		fmt.Printf("stack: %c, rslt: %v\n", stackBuilder[:stacki], rsltBuilder[:rslti])
	}
	for ; stacki-1 >= 0; stacki-- {
		if stackBuilder[stacki-1] == 'e' || stackBuilder[stacki-1] == 'z' || stackBuilder[stacki-1] == 'h' || stackBuilder[stacki-1] == 'G' || stackBuilder[stacki-1] == '(' {
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = ')'
			rslti++
		}
		if stackBuilder[stacki-1] == '[' {
			if rslti >= len(rsltBuilder) {
				return string(rsltBuilder[:rslti]), errors.New("FixUnary: Not enough space of rsltBuilder")
			}
			rsltBuilder[rslti] = ']'
			rslti++
		}
	}
	fmt.Printf("stack: %c\n", stackBuilder[:stacki])
	return string(rsltBuilder[:rslti]), nil
}

func main() {
	us_str := "[ee240]"
	var stack [255]rune
	var rslt [255]rune
	rsltStr, err := FixUnary(us_str, stack[:], rslt[:])
	if err != nil {
		fmt.Println(rsltStr, err)
	} else {
		fmt.Println(rsltStr)
	}
}
