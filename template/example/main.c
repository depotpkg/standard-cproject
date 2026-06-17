#include "{{projectName}}.h"

#include <stdio.h>

int main(int argc, char* argv[]) {
  int output = {{projectName}}();
  printf("{{projectName}} output: %d\n", output);
  return 0;
}
