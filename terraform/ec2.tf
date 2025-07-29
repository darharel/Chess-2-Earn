resource "aws_instance" "jenkins" {
  ami                    = var.jenkins_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
  key_name               = var.key_pair

  user_data = file("user_data.sh")

  tags = {
    Name = "C2E-pipeline"
  }
}