#ifndef {{projectNameUpper}}_H_
#define {{projectNameUpper}}_H_

#include <stddef.h>

#if !defined({{shortPrefix}}_API)
#if defined({{shortPrefix}}_DLL)
#if defined(_MSC_VER)
#if {{shortPrefix}}_IMPLEMENTATION
#define {{shortPrefix}}_API __declspec(dllexport)
#else
#define {{shortPrefix}}_API __declspec(dllimport)
#endif  // {{shortPrefix}}_IMPLEMENTATION
#else
#define {{shortPrefix}}_API __attribute__((visibility("default")))
#endif  // defined(_MSC_VER)
#else
#define {{shortPrefix}}_API
#endif  // defined({{shortPrefix}}_DLL)
#endif  // !defined({{shortPrefix}}_API)

{{shortPrefix}}_API int {{projectName}}();

#endif  // {{projectNameUpper}}_H_
