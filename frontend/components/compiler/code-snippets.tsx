"use client"
import { Bookmark } from "lucide-react"

type Language = "python" | "java"

interface CodeSnippetsProps {
  language: Language
  onSelect: (code: string) => void
}

const PYTHON_SNIPPETS = [
  {
    name: "Hello World",
    code: `print("Hello, World!")`,
  },
  {
    name: "Input Handling",
    code: `# Get user input
name = input("Enter your name: ")
age = int(input("Enter your age: "))
print(f"Hello {name}, you are {age} years old.")`,
  },
  {
    name: "File I/O",
    code: `# Writing to a file
with open("output.txt", "w") as file:
    file.write("Hello, World!")

# Reading from a file
with open("output.txt", "r") as file:
    content = file.read()
    print(content)`,
  },
  {
    name: "Sorting Algorithm",
    code: `# Bubble sort implementation
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)`,
  },
]

const JAVA_SNIPPETS = [
  {
    name: "Hello World",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },
  {
    name: "Input Handling",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.println("Hello " + name + ", you are " + age + " years old.");
        
        scanner.close();
    }
}`,
  },
  {
    name: "File I/O",
    code: `import java.io.*;

public class Main {
    public static void main(String[] args) {
        try {
            // Writing to a file
            FileWriter writer = new FileWriter("output.txt");
            writer.write("Hello, World!");
            writer.close();
            
            // Reading from a file
            FileReader reader = new FileReader("output.txt");
            BufferedReader bufferedReader = new BufferedReader(reader);
            String line = bufferedReader.readLine();
            System.out.println(line);
            bufferedReader.close();
        } catch (IOException e) {
            System.out.println("An error occurred: " + e.getMessage());
        }
    }
}`,
  },
  {
    name: "Sorting Algorithm",
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(numbers);
        System.out.println(Arrays.toString(numbers));
    }
    
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap arr[j] and arr[j+1]
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`,
  },
]

export const CodeSnippets = ({ language, onSelect }: CodeSnippetsProps) => {
  const snippets = language === "python" ? PYTHON_SNIPPETS : JAVA_SNIPPETS

  return (
    <div className="space-y-2">
      {snippets.map((snippet, index) => (
        <button
          key={index}
          onClick={() => onSelect(snippet.code)}
          className="w-full flex items-center space-x-2 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
        >
          <Bookmark className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-sm truncate">{snippet.name}</span>
        </button>
      ))}
    </div>
  )
}
