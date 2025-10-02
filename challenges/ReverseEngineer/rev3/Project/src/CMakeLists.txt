file(GLOB SRC_CPP cpp/*.cpp)
file(GLOB SRC_HPP hpp/*.hpp)

add_executable(giovannis_vault ${SRC_CPP} ${SRC_HPP})
