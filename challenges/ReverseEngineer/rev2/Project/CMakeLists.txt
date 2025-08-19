cmake_minimum_required(VERSION 3.28)
project(Tunnel_Network)

# target Unix when compiling
set(CMAKE_CXX_COMPILER g++)

# set std enforcement and compiler flags
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS "-Wno-reorder -Wunused-variable -Wunused-parameter -Wnarrowing -Werror=narrowing -Wno-error=all")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include_directories(
    src/hpp
    client/hpp
    )

# contains CMakeLists.txt file
add_subdirectory(src)
add_subdirectory(client)
