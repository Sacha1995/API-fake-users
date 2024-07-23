-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2024 at 04:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `users`
--

-- --------------------------------------------------------

--
-- Table structure for table `info`
--

CREATE TABLE `info` (
  `id` int(11) NOT NULL,
  `email` varchar(64) NOT NULL,
  `password` varchar(256) NOT NULL,
  `name` varchar(64) NOT NULL,
  `role` varchar(20) NOT NULL,
  `creationAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(250) NOT NULL,
  `profession` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `info`
--

INSERT INTO `info` (`id`, `email`, `password`, `name`, `role`, `creationAt`, `updatedAt`, `avatar`, `profession`) VALUES
(1, 'jorn@mail.com', '070d7760244d1fb91fcabdfb24c959e18e651a09d6f2959b4dfe96b7023a9ad0', 'benny', 'customer', '2024-07-20 11:18:16', '2024-07-20 11:18:16', '', ''),
(2, 'jor@mail.com', '070d7760244d1fb91fcabdfb24c959e18e651a09d6f2959b4dfe96b7023a9ad0', 'benny', 'customer', '2024-07-20 11:38:50', '2024-07-20 11:38:50', '', ''),
(3, 'jornn@mail.com', '070d7760244d1fb91fcabdfb24c959e18e651a09d6f2959b4dfe96b7023a9ad0', 'benny', 'customer', '2024-07-20 11:40:08', '2024-07-20 11:40:08', '', ''),
(4, 'jornnn@mail.com', '070d7760244d1fb91fcabdfb24c959e18e651a09d6f2959b4dfe96b7023a9ad0', 'Russel', 'customer', '2024-07-20 11:41:19', '2024-07-20 12:07:07', '', 'teacher');

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `token` varchar(128) NOT NULL,
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tokens`
--

INSERT INTO `tokens` (`token`, `id`, `user_id`, `entry_date`) VALUES
('975961823626501721475191240', 1, 1, '2024-07-20 11:33:11'),
('35182439510111721475535867', 2, 2, '2024-07-20 11:38:55'),
('426357919153271721475614782', 3, 3, '2024-07-20 11:40:14'),
('149101148831811721475683437', 4, 4, '2024-07-20 11:41:23'),
('394708783213401721475712745', 5, 4, '2024-07-20 11:41:52'),
('533349251217141721475714355', 6, 4, '2024-07-20 11:41:54'),
('250093421673861721475714976', 7, 4, '2024-07-20 11:41:54'),
('297681560625901721478011304', 8, 4, '2024-07-20 12:20:11'),
('999330005383791721478741989', 9, 4, '2024-07-20 12:32:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `info`
--
ALTER TABLE `info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `info`
--
ALTER TABLE `info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
