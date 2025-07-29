variable "region" {
  default = "eu-central-1"
}

variable "instance_type" {
  default = "t3.medium"
}

variable "key_pair" {
  description = "Your existing EC2 key pair name"
}

variable "jenkins_ami" {
  default = "ami-02003f9f0fde924ea"
}
