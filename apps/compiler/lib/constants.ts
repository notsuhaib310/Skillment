import type { Language } from "./types"

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    id: 63, // JavaScript (Node.js 12.14.0)
    name: "JavaScript",
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript
function hello(name = "World") {
    console.log(\`Hello, \${name}!\`);
}

hello();`,
  },
  {
    id: 71, // Python (3.8.1)
    name: "Python",
    monacoLanguage: "python",
    defaultCode: `# Python
def main():
    name = "World"
    print(f"Hello, {name}!")

if __name__ == "__main__":
    main()`,
  },
  {
    id: 54, // C++ (GCC 9.2.0)
    name: "C++",
    monacoLanguage: "cpp",
    defaultCode: `// C++
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "World";
    cout << "Hello, " << name << "!" << endl;
    return 0;
}`,
  },
  {
    id: 50, // C (GCC 9.2.0)
    name: "C",
    monacoLanguage: "c",
    defaultCode: `// C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  },
  {
    id: 62, // Java (OpenJDK 13.0.1)
    name: "Java",
    monacoLanguage: "java",
    defaultCode: `// Java
public class Main {
    public static void main(String[] args) {
        String name = "World";
        System.out.println("Hello, " + name + "!");
    }
}`,
  },
  {
    id: 51, // C# (Mono 6.6.0.161)
    name: "C#",
    monacoLanguage: "csharp",
    defaultCode: `// C#
using System;

class Program {
    static void Main() {
        string name = "World";
        Console.WriteLine($"Hello, {name}!");
    }
}`,
  },
  {
    id: 68, // PHP (7.4.1)
    name: "PHP",
    monacoLanguage: "php",
    defaultCode: `<?php
// PHP
$name = "World";
echo "Hello, " . $name . "!";
?>`,
  },
  {
    id: 72, // Ruby (2.7.0)
    name: "Ruby",
    monacoLanguage: "ruby",
    defaultCode: `# Ruby
name = "World"
puts "Hello, #{name}!"`,
  },
  {
    id: 73, // Rust (1.40.0)
    name: "Rust",
    monacoLanguage: "rust",
    defaultCode: `// Rust
fn main() {
    let name = "World";
    println!("Hello, {}!", name);
}`,
  },
  {
    id: 60, // Go (1.13.5)
    name: "Go",
    monacoLanguage: "go",
    defaultCode: `// Go
package main

import "fmt"

func main() {
    name := "World"
    fmt.Printf("Hello, %s!\\n", name)
}`,
  },
]
